# Specification — Phase 5: Insights and Explanations

This document specifies the metrics calculation logic, savings constraints, surprise detection, Coimbatore-based solar formulas, actions generation, and Gemini explanation routing.

---

## 1. Metrics & Formulas

All insights are calculated using deterministic formulas derived solely from the engine outputs.

### F9: Efficiency Gap (Headline Metric)
Calculates the excess consumption of existing appliances compared to new, 5-star efficient alternatives:
* **Ideal Consumption (`ideal`)**: Sum of estimates for all listed appliances recalculated with:
  * `star = 5`
  * `year = CURRENT_YEAR`
  * `symptoms = []`
* **Formula**:
  * `gap_percent = round((actual - ideal) / ideal * 100)` (floored at 0)
  * `gap_rupees = round((actual - ideal) * rate)` (floored at 0)
  * `driver`: The appliance type with the largest raw delta ($\text{actual\_est} - \text{ideal\_est}$).
  * `score = round(min(100, ideal / actual * 100))`
* **Null Conditions**: If `ideal <= 0` (no appliances listed), return gap percentages/rupees as `0` and driver as `None`.

### F10: CO2 Environmental Impact
Projects annual greenhouse emissions (kg CO2 equivalent) using the India grid average (`CO2_PER_KWH` = 0.71):
* **Baseline**:
  $$\text{co2\_kg\_year} = \text{round}\left(\text{units\_per\_cycle} \times \left(\frac{365}{\text{days}}\right) \times 0.71\right)$$
* **Projected**:
  $$\text{co2\_kg\_year\_after} = \text{round}\left(\left(\text{units\_per\_cycle} \times \left(\frac{365}{\text{days}}\right) - (\text{monthly\_savings\_units} \times 12)\right) \times 0.71\right)$$
  (where `monthly_savings_units` is calculated as $\frac{\text{monthly\_savings\_rupees}}{\text{rate}}$).

### F11: Savings Cap
Calculates cumulative savings from recommended actions:
* **Formula**:
  * `monthly = sum(saves_rupees for each generated action)`
  * `annual = monthly * 12`
* **Cap Constraint**: Combined savings is **capped at 40% of the actual bill amount** to maintain credibility. A warning is logged if the cap is triggered.

### F12: Biggest Surprise (Deviation Card)
Detects which appliance consumes the most disproportionate share compared to standard baselines (BEE CLASP survey 2024):
* **Formula**:
  $$\text{deviation} = \left(\frac{\text{appliance\_units}}{\text{bill.units\_consumed}}\right) - \text{TYPICAL\_SHARE}[\text{appliance\_type}]$$
* **Result**: Return the appliance with the maximum positive deviation.
* **Null Conditions**: Return `None` if no appliance has a positive deviation.

### F16: Solar Potential (Coimbatore Model)
Recommends residential solar size based on generation capacity in TN (1450 kWh/kW/year):
* **Formula**:
  * $\text{annual\_units} = \text{units\_consumed} \times \left(\frac{365}{\text{days}}\right)$
  * $\text{size\_kw} = \max(1, \min(3, \text{round}(\text{annual\_units} / 1450)))$
  * $\text{net\_cost\_rupees} = (\text{size\_kw} \times 60000) - \text{SUBSIDY\_TABLE}[\text{size\_kw}]$
  * $\text{annual\_saving\_rupees} = \min(\text{annual\_units}, \text{size\_kw} \times 1450) \times \text{rate}$
  * $\text{payback\_years} = \frac{\text{net\_cost\_rupees}}{\text{annual\_saving\_rupees}}$
* **Null Conditions**: If $\text{annual\_saving\_rupees} \le 0$ or $\text{payback\_years} > 15$, return `None` (payback is too long to recommend).

---

## 2. Actions Generation Engine

Generates at most one action per tier (Free, Cheap, Investment):

### 1. Free Action (Behavioral)
* **Trigger**: AC is listed with `hours_band` $\ge$ "4-6".
* **Formula**: `saves_rupees = ac_rupees * 0.22` (setting temperature to 26°C yields ~22% savings).
* **Text**: *"ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும்."*

### 2. Cheap Action (Maintenance)
* **Trigger**: Appliance has symptoms indicating maintenance issues (e.g. dirty filters, scale, bad door seal).
* **Formula**: `saves_rupees = appliance_rupees * (1 - 1 / symptom_multiplier)`.
* **Text**: Ending with *"பழுதுகளை சரிசெய்து கொள்ளவும்."*

### 3. Investment Action (Replacement)
* **Trigger**: Appliance age $> 8$ years and star rating $\le 3$.
* **Formula**:
  * $\text{saves\_rupees} = \text{appliance\_rupees} \times \left(1 - \frac{\text{STAR\_MULT}[5]}{\text{STAR\_MULT}[\text{star}]} / \text{age\_f}\right)$
  * $\text{payback\_months} = \text{round}\left(\frac{\text{REPLACEMENT\_COST}[\text{appliance\_type}]}{\text{monthly\_saves}}\right)$
* **Costs Table**: `ac`: ₹38,000, `fridge`: ₹28,000, `geyser`: ₹9,000.

---

## 3. Gemini Explanation Prompt & Fallback

Explanations are requested from the Gemini model using fixed inputs to prevent hallucination.

### The System Prompt:
```
Write a short explanation in {language} using ONLY these numbers:

Bill total: Rs {total} for {units} units over {days} days.
Breakdown: {ranked_list_with_rupees_and_percent}
Top action: {action_text}, saving about Rs {savings}/month.

Rules:
- Do NOT introduce any number that is not listed above.
- Do NOT round differently than given.
- Name the single largest consumer in the first sentence.
- 2 short sentences, then 1 recommendation sentence.
- Plain conversational {language}. No technical jargon.
- If the language is Tamil, do not use English technical words.
```

### Hardcoded Fallback (in case of API error):
If Gemini fails, the system outputs a non-AI template:
* **English**: *"Your electricity consumption is {units} units, totalling Rs {total}. {top_appliance} is your largest contributor. We recommend you {top_action} to save approximately Rs {savings} per month."*
* **Tamil**: *"உங்கள் மின் நுகர்வு {units} யூனிட்கள், மொத்த மதிப்பு ரூ. {total}. இதில் {top_appliance} அதிக மின்சாரத்தைப் பயன்படுத்துகிறது. சேமிப்பிற்காக, {top_action} பரிந்துரைக்கிறோம் (மாதாந்திர சேமிப்பு சுமார் ரூ. {savings})."*
