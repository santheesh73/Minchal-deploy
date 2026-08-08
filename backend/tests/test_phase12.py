"""Phase 12 — budget-constrained action planning.

A knapsack over figures the deterministic engine already produced. No LLM is
involved in this path by design: budget advice is exactly where a chat surface
would start inventing rupee figures, which is the claim this product rests on.
"""
import os
import sys
import json
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from schemas import AnalyzeResponse, PlanBudgetResponse, Action
from engine.actions import plan_within_budget
from engine.tables import MAINTENANCE_COST, REPLACEMENT_COST

client = TestClient(app)
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FREE = {"tier": "free", "text": "AC to 26C", "saves_rupees": 557.0, "cost_rupees": 0.0}
CHEAP = {"tier": "cheap", "text": "clean filters", "saves_rupees": 120.0, "cost_rupees": 800.0}
INVEST = {"tier": "investment", "text": "replace AC", "saves_rupees": 900.0, "cost_rupees": 38000.0}
ACTIONS = [FREE, CHEAP, INVEST]


def tiers(plan):
    return [a["tier"] for a in plan["selected"]]


def test_budget_zero_returns_free_actions_only():
    plan = plan_within_budget(ACTIONS, 0)
    assert tiers(plan) == ["free"]
    assert plan["total_cost_rupees"] == 0.0
    assert plan["total_annual_saving_rupees"] == pytest.approx(557.0 * 12, abs=0.01)
    assert len(plan["excluded"]) == 2


def test_budget_exceeding_all_costs_returns_everything():
    plan = plan_within_budget(ACTIONS, 100000)
    assert set(tiers(plan)) == {"free", "cheap", "investment"}
    assert plan["excluded"] == []
    assert plan["total_cost_rupees"] == 38800.0
    assert plan["budget_remaining_rupees"] == pytest.approx(100000 - 38800)


def test_greedy_picks_best_savings_per_rupee_first():
    """cheap: 1440/yr for Rs 800 = 1.80 per rupee.
       investment: 10800/yr for Rs 38000 = 0.28 per rupee.
       With room for only one, the cheap one must win."""
    plan = plan_within_budget(ACTIONS, 1000)
    assert tiers(plan) == ["free", "cheap"]
    assert plan["excluded"][0]["tier"] == "investment"


def test_greedy_order_is_by_ratio_not_by_absolute_saving():
    """The investment saves far more in absolute terms; ratio must still win."""
    plan = plan_within_budget(ACTIONS, 38000)
    assert "cheap" in tiers(plan)
    assert "investment" not in tiers(plan), "spent the whole budget on the worse ratio"


def test_exclusions_explain_themselves():
    plan = plan_within_budget(ACTIONS, 1000)
    ex = plan["excluded"][0]
    assert "38,000" in ex["reason"] or "38000" in ex["reason"]
    assert ex["annual_saving_rupees"] == pytest.approx(900.0 * 12, abs=0.01)


def test_free_actions_never_compete_for_budget():
    plan = plan_within_budget([FREE, dict(FREE, text="second free")], 0)
    assert len(plan["selected"]) == 2
    assert plan["total_cost_rupees"] == 0.0


def test_negative_and_garbage_budgets_are_treated_as_zero():
    for bad in (-500, None, "abc"):
        plan = plan_within_budget(ACTIONS, bad)
        assert tiers(plan) == ["free"], f"budget={bad!r}"


def test_missing_cost_is_treated_as_free_not_infinite():
    """An action without cost_rupees must not silently vanish from every plan."""
    plan = plan_within_budget([{"tier": "free", "text": "x", "saves_rupees": 10.0}], 0)
    assert len(plan["selected"]) == 1


def test_totals_are_internally_consistent():
    plan = plan_within_budget(ACTIONS, 40000)
    assert plan["total_cost_rupees"] + plan["budget_remaining_rupees"] == pytest.approx(40000)
    expected = sum(a["saves_rupees"] * 12 for a in plan["selected"])
    assert plan["total_annual_saving_rupees"] == pytest.approx(expected, abs=0.05)


# --- endpoint ---------------------------------------------------------------

def payload(budget):
    p = json.load(open(os.path.join(BASE, "mocks", "analyze_request.json"), encoding="utf-8"))
    p["budget_rupees"] = budget
    return p


def test_endpoint_returns_analyze_response_plus_plan():
    res = client.post("/api/plan-budget", json=payload(5000))
    assert res.status_code == 200, res.text
    data = res.json()
    # the standard analyze contract must still validate, unchanged
    AnalyzeResponse(**{k: v for k, v in data.items() if k != "budget_plan"})
    PlanBudgetResponse(**data)
    assert "budget_plan" in data


def test_endpoint_requires_a_budget():
    p = payload(5000)
    del p["budget_rupees"]
    assert client.post("/api/plan-budget", json=p).status_code == 422


def test_endpoint_plan_never_exceeds_the_budget():
    for budget in (0, 500, 5000, 100000):
        data = client.post("/api/plan-budget", json=payload(budget)).json()
        assert data["budget_plan"]["total_cost_rupees"] <= budget


def test_cost_tables_cover_every_costed_action_source():
    """Every symptom that generates a cheap action needs a price, and every
    replaceable appliance needs one too — otherwise the planner silently
    falls back to a default that nobody chose."""
    from engine.actions import SYMPTOM_ACTION_TEXT
    for symptom in SYMPTOM_ACTION_TEXT:
        assert symptom in MAINTENANCE_COST, f"no maintenance cost for {symptom}"
    for appliance in ("ac", "fridge", "geyser"):
        assert appliance in REPLACEMENT_COST


def test_no_gemini_call_in_the_budget_path():
    """The whole architectural point: budget advice must never reach an LLM."""
    from unittest.mock import patch
    import gemini.client as gclient

    def explode(*a, **k):
        raise AssertionError("plan_within_budget must not call Gemini")

    with patch.object(gclient, "get_client", explode), \
         patch.object(gclient, "call_with_fallback", explode):
        plan = plan_within_budget(ACTIONS, 5000)
    assert plan["selected"]
