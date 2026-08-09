# MINCHAL Calculation Engine Methodology

## Overview
The MINCHAL calculation engine translates user-selected household appliances and bill totals into precise, itemized energy and rupee breakdowns.

Every estimate is deterministic, traceable, and scaled directly to match the consumer's actual electricity consumption bill.

---

## Mathematical Formulation

### 1. Appliance Consumption Formulation

Each appliance's unscaled monthly energy consumption $E_{\text{raw}}$ (in kWh) is calculated as:

$$E_{\text{raw}} = \frac{P_{\text{rated}} \times \text{Hours} \times \text{DutyCycle} \times M_{\text{star}} \times M_{\text{age}} \times M_{\text{symptoms}} \times \text{BillingDays}}{1000}$$

Where:
- $P_{\text{rated}}$: Rated power in Watts (from standard lookup table or optional rating-plate OCR).
- $\text{Hours}$: Midpoint of daily usage range selected by user (e.g., `4-8` hrs $\rightarrow$ 6 hours).
- $\text{DutyCycle}$: Compressor or heating element cycle fraction (e.g., Refrigerator: 0.40, AC: 0.55, Lighting: 1.0).
- $M_{\text{star}}$: Star rating efficiency factor ($1\star$: 1.25, $3\star$: 1.00, $5\star$: 0.82).
- $M_{\text{age}}$: Degradation factor based on manufacture year ($+1.5\%$ efficiency loss per year over 5 years).
- $M_{\text{symptoms}}$: Cumulative multiplier from observed inefficiency symptoms (e.g., dirty AC filter $+15\%$, leaking door seal $+20\%$).

---

### 2. Bill Normalization & Rupee Attribution

To ensure that the sum of itemized appliance estimates equals the exact total bill units $U_{\text{bill}}$, a normalization factor $S$ is calculated:

$$S = \frac{U_{\text{bill}}}{\sum E_{\text{raw}} + E_{\text{other\_baseline}}}$$

The normalized monthly energy for appliance $i$ is:

$$E_i = E_{\text{raw}, i} \times S$$

The rupee cost $C_i$ for appliance $i$ is derived using the effective tariff rate $R = \frac{\text{Total Bill Amount (₹)}}{U_{\text{bill}}}$:

$$C_i = E_i \times R$$

---

## Worked Example

### Household Scenario:
- **Bill**: 350 kWh for ₹2,400 over 60 billing days (Effective rate: ₹6.86/kWh).
- **Selected Appliance**: 3-Star AC (1.5 Ton, 1500W, runtime 4–8 hrs/day = 6 hrs, dirty filter symptom).

### Calculation Steps:
1. $P_{\text{rated}} = 1500\text{ W}$, $\text{DutyCycle} = 0.55$, $M_{\text{star}} = 1.00$, $M_{\text{age}} = 1.00$, $M_{\text{symptom}} = 1.15$.
2. Daily energy: $1500 \times 6 \times 0.55 \times 1.15 = 5,692.5\text{ Wh/day} = 5.69\text{ kWh/day}$.
3. 60-day energy: $5.69 \times 60 = 341.5\text{ kWh}$.
4. Normalization factor applied across total inventory yields normalized units and exact rupee cost: $C_{\text{AC}} = E_{\text{AC}} \times \text{Rate}$.
