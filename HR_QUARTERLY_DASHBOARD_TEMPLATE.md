# HR Quarterly Dashboard Template

This template is designed to give HR leaders a complete quarterly view of workforce health, talent pipeline, retention risk, DEI progress, people costs, and manager effectiveness.

## 1) Executive Snapshot (Top of Dashboard)

Use this section for fast decision-making at a glance.

| KPI | Current Quarter | Previous Quarter | Target | Status |
|---|---:|---:|---:|---|
| Headcount (end of quarter) |  |  |  |  |
| Voluntary turnover rate |  |  |  |  |
| Regrettable attrition rate |  |  |  |  |
| Time-to-fill (days) |  |  |  |  |
| Offer acceptance rate |  |  |  |  |
| Internal mobility rate |  |  |  |  |
| Engagement score |  |  |  |  |
| Absenteeism rate |  |  |  |  |
| Revenue per employee (optional) |  |  |  |  |

## 2) Core KPI Categories

## A. Workforce Composition

- Starting headcount
- Ending headcount
- Net headcount change
- Average headcount
- Full-time vs part-time mix
- Contingent worker ratio
- Geography / business unit / department mix
- Span of control (IC-to-manager ratio)

## B. Hiring & Talent Acquisition

- Open requisitions
- Time-to-fill
- Time-to-hire
- Cost-per-hire
- Offer acceptance rate
- Source-of-hire mix
- Pipeline conversion rates (stage-by-stage)
- Quality-of-hire (90-day performance, 6-month retention)

## C. Attrition & Retention

- Overall attrition rate
- Voluntary attrition rate
- Involuntary attrition rate
- Regrettable attrition rate
- New-hire attrition (0–90 days / first year)
- High-performer attrition
- Retention rate by manager
- Retention by tenure band

## D. Performance & Development

- Performance rating distribution
- Goal completion rate
- Learning hours per employee
- Certification completion rate
- Promotion rate
- Internal mobility rate
- Succession bench strength for critical roles

## E. Engagement & Culture

- Employee engagement score (overall)
- eNPS
- Favorability by key themes (trust, growth, wellbeing)
- Participation rate in surveys
- Pulse trend over quarter
- Psychological safety index (if measured)

## F. DEI (Diversity, Equity, Inclusion)

- Representation by level (entry, manager, director, executive)
- Hiring representation by stage
- Promotion equity ratio
- Pay equity gap indicators
- Retention rate by demographic group
- Inclusion score gap analysis

## G. Attendance, Wellbeing, and Employee Relations

- Absenteeism rate
- PTO utilization rate
- Burnout risk index (survey + overtime proxy)
- ER case volume and resolution time
- Safety incidents (if applicable)

## H. Cost & Productivity

- Total people cost
- People cost as % of revenue
- Overtime % and cost
- Revenue per employee (or output per employee)
- HR cost per employee

## 3) Recommended Metric Definitions (Consistent Formulas)

Use one global standard for each KPI so quarter-over-quarter comparisons remain valid.

- **Attrition rate (%)** = (Number of exits during quarter / Average headcount during quarter) x 100
- **Voluntary attrition rate (%)** = (Voluntary exits / Average headcount) x 100
- **Regrettable attrition rate (%)** = (Regrettable exits / Average headcount) x 100
- **Retention rate (%)** = 100 - attrition rate
- **Time-to-fill (days)** = Requisition approval date to accepted offer date (median preferred)
- **Time-to-hire (days)** = Candidate applied date to accepted offer date (median preferred)
- **Offer acceptance rate (%)** = (Accepted offers / Total offers extended) x 100
- **Internal mobility rate (%)** = (Employees who changed role internally / Average headcount) x 100
- **Absenteeism rate (%)** = (Unplanned absence days / Total available workdays) x 100
- **Promotion rate (%)** = (Employees promoted during quarter / Average headcount) x 100
- **Cost-per-hire** = (External recruiting costs + internal recruiting costs) / Total hires

## 4) Dashboard Views You Should Include

To keep the dashboard “all data at your fingertips,” include filters and drill-downs.

### Filters
- Quarter
- Year
- Department / Business Unit
- Location
- Employment type
- Manager hierarchy
- Tenure band
- Job family

### Visuals
- KPI cards for executive snapshot
- Trend lines (last 8 quarters)
- Funnel chart for recruiting pipeline
- Heatmap for attrition by manager and department
- Stacked bars for diversity representation
- Box plot or distribution chart for performance ratings
- Scatter plot: engagement vs attrition by team

### Drill-Down Pages
1. Executive overview
2. Hiring effectiveness
3. Retention and attrition risk
4. Performance and growth
5. DEI progress
6. Cost and productivity

## 5) Practical Data Model (Minimum Fields)

Collect these fields to support nearly every KPI above.

### Employee master data
- employee_id
- hire_date
- termination_date
- termination_type (voluntary/involuntary/regrettable)
- department
- business_unit
- location
- manager_id
- level
- employment_type
- demographic attributes (as legally and ethically appropriate)

### Recruiting data
- requisition_id
- requisition_open_date
- requisition_close_date
- candidate_id
- application_date
- offer_date
- offer_status
- source_channel
- hire_date
- recruiting_cost

### Engagement and development data
- survey_date
- engagement_score
- eNPS
- learning_hours
- course_completion
- performance_rating
- promotion_flag
- internal_move_flag

### Attendance and ER data
- absence_date
- absence_type
- absence_days
- ER_case_id
- ER_case_type
- ER_open_date
- ER_close_date

## 6) Operating Cadence (Quarterly)

- Week 1 after quarter close: data extraction and QA
- Week 2: KPI calculation and benchmarking
- Week 3: leadership insights + action plan
- Week 4: publish dashboard + manager scorecards

## 7) Recommended Targets (Starter Benchmarks)

Customize by industry and labor market.

- Voluntary attrition: < 10% annualized equivalent
- Offer acceptance: > 85%
- Time-to-fill: < 45 days
- New-hire 90-day attrition: < 5%
- Internal mobility: > 12% annualized equivalent
- Engagement score: > 75 favorable

## 8) Action Layer (Make It Useful, Not Just Informative)

For each KPI, include:
- owner (HRBP / TA lead / L&D lead)
- threshold (green/yellow/red)
- root-cause note
- action due date
- expected impact

This turns the dashboard from a reporting tool into an execution tool.

## 9) Quarterly Review Template (1-page)

- What improved this quarter?
- What worsened this quarter?
- Which teams are highest risk and why?
- Top 3 HR actions for next quarter
- Decisions needed from leadership

---

If you want, convert this template directly into a spreadsheet tab structure:
- `Executive_Snapshot`
- `Hiring`
- `Attrition`
- `Engagement`
- `DEI`
- `Cost_Productivity`
- `Action_Tracker`
