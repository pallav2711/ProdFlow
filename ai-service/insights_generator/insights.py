"""
Advanced AI Insights Generator
Produces deep, data-driven, actionable insights from performance metrics.
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# ── helpers ──────────────────────────────────────────────────────────────────

def _name(row: pd.Series, id_col: str) -> str:
    name_col = id_col.replace('_id', '_name')
    return str(row.get(name_col) or row.get(id_col) or 'Unknown')

def _pct(v: float) -> str:
    return f"{v:.1f}%"

def _ratio(v: float) -> str:
    return f"{v:.1%}"

def _insight(itype: str, category: str, message: str, priority: str,
             metric: str = '', value: float = 0.0, benchmark: float = 0.0,
             action: str = '', data: Dict = None) -> Dict[str, Any]:
    return {
        'insight_type': itype,
        'category': category,
        'message': message,
        'priority': priority,
        'metric': metric,
        'value': round(float(value), 2),
        'benchmark': round(float(benchmark), 2),
        'action': action,
        'data': data or {},
    }


# ── main class ────────────────────────────────────────────────────────────────

class InsightsGenerator:

    # ── developer insights ────────────────────────────────────────────────────

    def generate_developer_insights(self, dev_df: pd.DataFrame, task_df: pd.DataFrame) -> List[Dict]:
        insights = []
        if dev_df.empty:
            return insights

        avg_eff = dev_df['efficiency_score'].mean()
        avg_reviews = dev_df['avg_review_cycles'].mean()
        avg_ontime = dev_df['on_time_completion_rate'].mean()

        # ── outlier: star performer ──
        top = dev_df.nlargest(1, 'efficiency_score').iloc[0]
        if top['efficiency_score'] >= 75:
            gap = top['efficiency_score'] - avg_eff
            insights.append(_insight(
                'positive', 'developer',
                f"{_name(top,'developer_id')} leads the team with {_pct(top['efficiency_score'])} efficiency "
                f"— {_pct(gap)} above team average. "
                f"First-time approval rate: {_ratio(top['first_time_approval_rate'])}, "
                f"on-time delivery: {_ratio(top['on_time_completion_rate'])}.",
                'high', 'efficiency_score', top['efficiency_score'], avg_eff,
                'Consider this developer as a mentor or code-review lead.',
                {'developer_id': top['developer_id']}
            ))

        # ── at-risk developers ──
        at_risk = dev_df[dev_df['efficiency_score'] < 55]
        for _, dev in at_risk.iterrows():
            root_causes = []
            if dev['completion_rate'] < 0.6:
                root_causes.append(f"only {_ratio(dev['completion_rate'])} tasks completed")
            if dev['avg_review_cycles'] > 2.5:
                root_causes.append(f"{dev['avg_review_cycles']:.1f} avg review cycles")
            if dev['on_time_completion_rate'] < 0.6:
                root_causes.append(f"{_ratio(dev['on_time_completion_rate'])} on-time rate")
            cause_str = '; '.join(root_causes) if root_causes else 'multiple weak signals'
            insights.append(_insight(
                'warning', 'developer',
                f"{_name(dev,'developer_id')} is at risk ({_pct(dev['efficiency_score'])} efficiency): {cause_str}.",
                'high', 'efficiency_score', dev['efficiency_score'], 60.0,
                'Schedule a 1-on-1, review task complexity allocation, and pair with a senior developer.',
                {'developer_id': dev['developer_id']}
            ))

        # ── code quality bottleneck ──
        high_review = dev_df[dev_df['avg_review_cycles'] > avg_reviews + 0.8]
        for _, dev in high_review.head(2).iterrows():
            insights.append(_insight(
                'warning', 'code_quality',
                f"{_name(dev,'developer_id')} averages {dev['avg_review_cycles']:.1f} review cycles "
                f"vs team avg of {avg_reviews:.1f}. "
                f"First-time approval rate is only {_ratio(dev['first_time_approval_rate'])}.",
                'medium', 'avg_review_cycles', dev['avg_review_cycles'], avg_reviews,
                'Introduce pre-review checklists and pair-programming sessions.',
                {'developer_id': dev['developer_id']}
            ))

        # ── deadline risk ──
        deadline_risk = dev_df[dev_df['on_time_completion_rate'] < avg_ontime - 0.15]
        for _, dev in deadline_risk.head(2).iterrows():
            insights.append(_insight(
                'warning', 'deadline',
                f"{_name(dev,'developer_id')} misses deadlines {dev['deadline_misses']} time(s) "
                f"with only {_ratio(dev['on_time_completion_rate'])} on-time rate "
                f"(team avg: {_ratio(avg_ontime)}).",
                'high', 'on_time_completion_rate', dev['on_time_completion_rate'], avg_ontime,
                'Review task estimation accuracy and check for hidden blockers.',
                {'developer_id': dev['developer_id']}
            ))

        # ── speed outlier (positive) ──
        fast = dev_df[dev_df['avg_completion_speed'] > 1.15]
        for _, dev in fast.head(1).iterrows():
            insights.append(_insight(
                'positive', 'developer',
                f"{_name(dev,'developer_id')} consistently finishes tasks faster than estimated "
                f"(speed ratio {dev['avg_completion_speed']:.2f}x). "
                f"This may indicate under-estimation — consider revising story points.",
                'low', 'avg_completion_speed', dev['avg_completion_speed'], 1.0,
                'Validate estimates with this developer to improve sprint accuracy.',
                {'developer_id': dev['developer_id']}
            ))

        # ── team-wide code quality ──
        if avg_reviews > 2.2:
            insights.append(_insight(
                'recommendation', 'team',
                f"Team-wide average review cycles is {avg_reviews:.1f} — above the healthy threshold of 2.0. "
                f"This adds friction to every sprint and delays delivery.",
                'medium', 'avg_review_cycles', avg_reviews, 2.0,
                'Run a team code-quality workshop; introduce linting and automated checks in CI.',
            ))

        return insights

    # ── team lead insights ────────────────────────────────────────────────────

    def generate_teamlead_insights(self, tl_df: pd.DataFrame, sprint_df: pd.DataFrame) -> List[Dict]:
        insights = []
        if tl_df.empty:
            return insights

        avg_eff = tl_df['efficiency_score'].mean()

        # ── best planner ──
        best = tl_df.nlargest(1, 'planning_quality_score').iloc[0]
        if best['planning_quality_score'] >= 70:
            insights.append(_insight(
                'positive', 'team_lead',
                f"{_name(best,'team_lead_id')} has the strongest sprint planning quality "
                f"({_pct(best['planning_quality_score'])}) with a "
                f"{_ratio(best['avg_sprint_success_rate'])} sprint success rate across "
                f"{best['sprints_managed']} sprints.",
                'medium', 'planning_quality_score', best['planning_quality_score'], 70.0,
                'Share planning templates and retrospective practices with the wider team.',
                {'team_lead_id': best['team_lead_id']}
            ))

        # ── slow reviewer ──
        slow = tl_df[tl_df['avg_review_time_hours'] > 20]
        for _, tl in slow.iterrows():
            insights.append(_insight(
                'warning', 'team_lead',
                f"{_name(tl,'team_lead_id')} takes an average of {tl['avg_review_time_hours']:.1f}h to review — "
                f"blocking developer flow. Industry best practice is under 8h.",
                'high', 'avg_review_time_hours', tl['avg_review_time_hours'], 8.0,
                'Set a review SLA of 8 hours; use async review tools to reduce context-switching.',
                {'team_lead_id': tl['team_lead_id']}
            ))

        # ── poor sprint success ──
        low_success = tl_df[tl_df['avg_sprint_success_rate'] < 0.65]
        for _, tl in low_success.iterrows():
            insights.append(_insight(
                'warning', 'team_lead',
                f"{_name(tl,'team_lead_id')} has a {_ratio(tl['avg_sprint_success_rate'])} sprint success rate. "
                f"Planning quality score: {_pct(tl['planning_quality_score'])}. "
                f"Task balance score: {_pct(tl['task_distribution_balance_score'])}.",
                'high', 'avg_sprint_success_rate', tl['avg_sprint_success_rate'], 0.75,
                'Reduce sprint scope by 15-20%, improve backlog grooming, and add buffer tasks.',
                {'team_lead_id': tl['team_lead_id']}
            ))

        # ── task imbalance ──
        imbalanced = tl_df[tl_df['task_distribution_balance_score'] < 60]
        for _, tl in imbalanced.head(1).iterrows():
            insights.append(_insight(
                'recommendation', 'team_lead',
                f"{_name(tl,'team_lead_id')} has uneven task distribution "
                f"(balance score: {_pct(tl['task_distribution_balance_score'])}). "
                f"Some developers may be overloaded while others are underutilised.",
                'medium', 'task_distribution_balance_score', tl['task_distribution_balance_score'], 80.0,
                'Use capacity-based assignment: distribute by estimated hours, not task count.',
                {'team_lead_id': tl['team_lead_id']}
            ))

        # ── over-utilisation ──
        over = tl_df[tl_df['team_utilization_rate'] > 0.92]
        for _, tl in over.head(1).iterrows():
            insights.append(_insight(
                'warning', 'team_lead',
                f"{_name(tl,'team_lead_id')}'s team is running at "
                f"{_ratio(tl['team_utilization_rate'])} utilisation — leaving no buffer for "
                f"unplanned work, bugs, or reviews.",
                'high', 'team_utilization_rate', tl['team_utilization_rate'], 0.80,
                'Target 75-80% utilisation to maintain sustainable pace and quality.',
                {'team_lead_id': tl['team_lead_id']}
            ))

        return insights

    # ── trend & team-level insights ───────────────────────────────────────────

    def generate_trend_insights(self, dev_df: pd.DataFrame, tl_df: pd.DataFrame) -> List[Dict]:
        insights = []

        if not dev_df.empty and 'trend' in dev_df.columns:
            improving = dev_df[dev_df['trend'] == 'improving']
            declining = dev_df[dev_df['trend'] == 'declining']

            if not improving.empty:
                names = ', '.join([_name(r, 'developer_id') for _, r in improving.iterrows()])
                insights.append(_insight(
                    'positive', 'trend',
                    f"{len(improving)} developer(s) on an upward trajectory: {names}. "
                    f"Average efficiency gain detected over recent sprints.",
                    'medium', 'trend_improving', len(improving), 0,
                    'Recognise progress publicly; assign stretch tasks to sustain momentum.',
                ))

            if not declining.empty:
                names = ', '.join([_name(r, 'developer_id') for _, r in declining.iterrows()])
                avg_drop = declining['efficiency_score'].mean()
                insights.append(_insight(
                    'warning', 'trend',
                    f"{len(declining)} developer(s) showing a downward trend: {names}. "
                    f"Current avg efficiency: {_pct(avg_drop)}. Early intervention prevents further decline.",
                    'high', 'trend_declining', len(declining), 0,
                    'Investigate workload, blockers, or personal factors. Adjust sprint allocation.',
                ))

        if not tl_df.empty and 'trend' in tl_df.columns:
            improving_tl = tl_df[tl_df['trend'] == 'improving']
            if not improving_tl.empty:
                names = ', '.join([_name(r, 'team_lead_id') for _, r in improving_tl.iterrows()])
                insights.append(_insight(
                    'positive', 'trend',
                    f"Team lead(s) improving management effectiveness: {names}.",
                    'low', 'tl_trend_improving', len(improving_tl), 0,
                    'Share their practices in team retrospectives.',
                ))

        return insights

    def _generate_team_insights(self, dev_df: pd.DataFrame, tl_df: pd.DataFrame,
                                sprint_df: pd.DataFrame, task_df: pd.DataFrame) -> List[Dict]:
        insights = []

        # ── overall team health ──
        if not dev_df.empty:
            avg_eff = dev_df['efficiency_score'].mean()
            high_count = len(dev_df[dev_df['efficiency_score'] >= 80])
            low_count = len(dev_df[dev_df['efficiency_score'] < 55])

            if avg_eff >= 75:
                insights.append(_insight(
                    'positive', 'team',
                    f"Team is in strong health: {_pct(avg_eff)} average efficiency, "
                    f"{high_count} high performer(s), {low_count} needing support.",
                    'low', 'avg_efficiency', avg_eff, 75.0,
                    'Maintain momentum with regular retrospectives and knowledge sharing.',
                ))
            elif avg_eff < 60:
                insights.append(_insight(
                    'warning', 'team',
                    f"Team efficiency is below target at {_pct(avg_eff)}. "
                    f"{low_count} of {len(dev_df)} developers are underperforming.",
                    'high', 'avg_efficiency', avg_eff, 70.0,
                    'Audit sprint scope, remove blockers, and review estimation practices.',
                ))

        # ── sprint velocity trend ──
        if not sprint_df.empty and not task_df.empty and 'sprint_id' in task_df.columns:
            recent = sprint_df.tail(5)
            rates = []
            for _, sp in recent.iterrows():
                sp_tasks = task_df[task_df['sprint_id'] == sp['sprint_id']]
                if sp_tasks.empty:
                    continue
                done = len(sp_tasks[sp_tasks['status'] == 'Completed'])
                rates.append(done / len(sp_tasks))

            if len(rates) >= 3:
                avg_rate = np.mean(rates)
                trend_slope = np.polyfit(range(len(rates)), rates, 1)[0]
                if trend_slope < -0.05:
                    insights.append(_insight(
                        'warning', 'sprint',
                        f"Sprint completion rate is declining over the last {len(rates)} sprints "
                        f"(avg: {_ratio(avg_rate)}, slope: {trend_slope:+.2f}/sprint). "
                        f"Velocity is eroding.",
                        'high', 'sprint_completion_trend', avg_rate, 0.75,
                        'Reduce sprint commitment by 10-15% and focus on clearing technical debt.',
                    ))
                elif trend_slope > 0.05 and avg_rate >= 0.7:
                    insights.append(_insight(
                        'positive', 'sprint',
                        f"Sprint velocity is improving over the last {len(rates)} sprints "
                        f"(avg: {_ratio(avg_rate)}, slope: {trend_slope:+.2f}/sprint).",
                        'low', 'sprint_completion_trend', avg_rate, 0.75,
                        'Gradually increase sprint capacity to match improved throughput.',
                    ))

        # ── estimation accuracy ──
        if not task_df.empty:
            completed = task_df[
                (task_df['status'] == 'Completed') &
                (task_df['actual_hours'].notna()) &
                (task_df['actual_hours'] > 0) &
                (task_df['estimated_hours'] > 0)
            ]
            if len(completed) >= 5:
                ratios = completed['actual_hours'] / completed['estimated_hours']
                accurate = len(ratios[(ratios >= 0.8) & (ratios <= 1.2)])
                accuracy_rate = accurate / len(ratios)
                avg_overrun = ratios[ratios > 1.2].mean() if len(ratios[ratios > 1.2]) > 0 else 0

                if accuracy_rate < 0.5:
                    insights.append(_insight(
                        'recommendation', 'estimation',
                        f"Only {_ratio(accuracy_rate)} of tasks are estimated accurately "
                        f"(within ±20% of actual). Average overrun on late tasks: {avg_overrun:.1f}x. "
                        f"Poor estimation inflates sprint risk.",
                        'high', 'estimation_accuracy', accuracy_rate, 0.70,
                        'Run estimation calibration sessions; use historical actuals to anchor new estimates.',
                    ))
                elif accuracy_rate >= 0.75:
                    insights.append(_insight(
                        'positive', 'estimation',
                        f"Estimation accuracy is strong at {_ratio(accuracy_rate)} of tasks within ±20% of actual. "
                        f"This is a key driver of predictable sprint delivery.",
                        'low', 'estimation_accuracy', accuracy_rate, 0.70,
                    ))

        return insights

    # ── public entry point ────────────────────────────────────────────────────

    def generate_all_insights(self, dev_df: pd.DataFrame, tl_df: pd.DataFrame,
                              sprint_df: pd.DataFrame, task_df: pd.DataFrame) -> List[Dict]:
        all_insights: List[Dict] = []
        all_insights.extend(self.generate_developer_insights(dev_df, task_df))
        all_insights.extend(self.generate_teamlead_insights(tl_df, sprint_df))
        all_insights.extend(self.generate_trend_insights(dev_df, tl_df))
        all_insights.extend(self._generate_team_insights(dev_df, tl_df, sprint_df, task_df))

        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        all_insights.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 3))

        # Deduplicate by message prefix (first 60 chars)
        seen: set = set()
        unique: List[Dict] = []
        for ins in all_insights:
            key = ins['message'][:60]
            if key not in seen:
                seen.add(key)
                unique.append(ins)

        return unique[:20]
