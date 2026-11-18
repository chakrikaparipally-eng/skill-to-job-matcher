import { SkillDomain } from './types';

export const SKILLS_PART_1: SkillDomain[] = [
  {
    id: 'python-programming',
    slug: 'python-programming',
    number: '01',
    title: 'Python Programming',
    category: 'Foundations & Software',
    tagline: 'Write clean, readable Python from basic variables to object-oriented automation and APIs.',
    introduction:
      'Python is the most widely adopted programming language for beginners, data professionals, backend engineers, and AI developers. Its readable syntax lets you focus on problem-solving and algorithmic thinking rather than boilerplate syntax.',
    prerequisites: [
      'Basic familiarity with files, folders, and using a web browser',
      'Curiosity for logical problem solving — no prior coding required',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Core Syntax & Control Flow',
        milestones: ['Install Python 3 & VS Code', 'Master variables, lists, dicts, loops, and functions', 'Solve 20 string & array logic drills'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Modular Code & Data Handling',
        milestones: ['Read/write CSV and JSON files safely', 'Handle exceptions and write unit tests with pytest', 'Use virtual environments and pip'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Object-Oriented Design & APIs',
        milestones: ['Design reusable classes and dataclasses', 'Fetch live data from REST APIs with requests', 'Build a tested CLI automation utility'],
      },
    ],
    modules: [
      {
        id: 'py-mod-1',
        title: 'Variables, Data Types & Control Flow',
        level: 'Beginner',
        estimatedHours: 6,
        overview: 'Understand Python expressions, loops, conditionals, and core collections.',
        lessons: [
          {
            id: 'py-l1',
            title: 'Working with Variables, Lists & Dictionaries',
            durationMinutes: 25,
            summary: 'Store structured data using Python built-in collections and iterate cleanly.',
            steps: [
              'Create descriptive snake_case variable names for strings, integers, and floats.',
              'Use lists for ordered sequences and dictionaries for key-value lookups.',
              'Iterate over items with for-loops and list comprehensions.',
            ],
            practicalExample: 'Aggregating candidate skills and computing skill match counts from a profile dictionary.',
            codeExample: {
              language: 'python',
              code: `candidate = {
    "name": "Aarav Patel",
    "skills": ["Python", "SQL", "FastAPI", "Git"],
    "years_exp": 1.5
}

required = {"Python", "SQL", "Docker"}
matched = [s for s in candidate["skills"] if s in required]
print(f"{candidate['name']} matched {len(matched)}/{len(required)} skills: {matched}")`,
            },
          },
          {
            id: 'py-l2',
            title: 'Functions, Scope & Type Hints',
            durationMinutes: 30,
            summary: 'Write reusable, self-documenting functions using Python 3 type annotations.',
            steps: [
              'Define pure functions with def and explicit parameter/return type hints.',
              'Use default arguments safely (avoid mutable default lists).',
              'Return structured tuples or dictionaries for downstream callers.',
            ],
            practicalExample: 'Computing a weighted readiness score from technical quiz attempts.',
            codeExample: {
              language: 'python',
              code: `def calculate_readiness(scores: list[int], passing: int = 70) -> dict[str, float | bool]:
    if not scores:
        return {"average": 0.0, "passed": False}
    avg = sum(scores) / len(scores)
    return {"average": round(avg, 2), "passed": avg >= passing}

print(calculate_readiness([78, 84, 91]))`,
            },
          },
        ],
      },
      {
        id: 'py-mod-2',
        title: 'File I/O, Error Handling & Testing',
        level: 'Intermediate',
        estimatedHours: 8,
        overview: 'Parse JSON/CSV files reliably, catch edge-case exceptions, and verify behavior with pytest.',
        lessons: [
          {
            id: 'py-l3',
            title: 'Safe File Parsing & Exception Handling',
            durationMinutes: 35,
            summary: 'Use context managers (with) and try/except blocks to prevent crashes on malformed input.',
            steps: [
              'Open files using with open(..., encoding="utf-8") so descriptors always close.',
              'Parse JSON payloads with json.load and handle json.JSONDecodeError explicitly.',
              'Raise descriptive ValueError exceptions when domain invariants fail.',
            ],
            practicalExample: 'Validating an exported JSON job feed before processing.',
            codeExample: {
              language: 'python',
              code: `import json
from pathlib import Path

def load_jobs(path: str) -> list[dict]:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Job feed not found: {path}")
    with file_path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    return [job for job in data if "title" in job and "company" in job]`,
            },
          },
        ],
      },
      {
        id: 'py-mod-3',
        title: 'Object-Oriented Python & HTTP APIs',
        level: 'Advanced',
        estimatedHours: 10,
        overview: 'Model domain objects with dataclasses and consume external REST APIs.',
        lessons: [
          {
            id: 'py-l4',
            title: 'Dataclasses & Clean API Clients',
            durationMinutes: 40,
            summary: 'Combine dataclasses with urllib/requests to build strongly structured API wrappers.',
            steps: [
              'Model domain records using @dataclass(frozen=True) for immutability.',
              'Set explicit HTTP timeouts and check status codes with raise_for_status().',
              'Separate network transport from business transformation logic.',
            ],
            practicalExample: 'Wrapping a public repository API into normalized developer skill records.',
            codeExample: {
              language: 'python',
              code: `from dataclasses import dataclass

@dataclass(frozen=True)
class SkillMetric:
    name: str
    score: float

    def is_proficient(self) -> bool:
        return self.score >= 75.0

metric = SkillMetric(name="Python", score=88.5)
print(metric.is_proficient())`,
            },
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'py-proj-1',
        title: 'CLI Expense & Budget CSV Analyzer',
        difficulty: 'Beginner',
        description: 'Read a CSV ledger of daily expenses, categorize totals, and export a formatted monthly summary.',
        deliverables: ['Python script using csv & collections.Counter', 'Sample CSV dataset', 'Unit tests for category totals'],
        skillsPracticed: ['File I/O', 'Dictionaries', 'Functions'],
      },
      {
        id: 'py-proj-2',
        title: 'Automated Job Feed Filter Utility',
        difficulty: 'Intermediate',
        description: 'Fetch public JSON job postings, filter by skill keywords, and rank matches by skill overlap.',
        deliverables: ['Dataclass job model', 'Keyword matcher module', 'Pytest suite covering edge cases'],
        skillsPracticed: ['Dataclasses', 'APIs', 'Pytest'],
      },
    ],
    resources: [
      { title: 'Official Python 3 Tutorial', provider: 'Python.org', type: 'Documentation', url: 'https://docs.python.org/3/tutorial/' },
      { title: 'Python for Everybody (Full Course)', provider: 'freeCodeCamp', type: 'Video', url: 'https://www.youtube.com/watch?v=8DvywoWv6fI' },
      { title: 'CS50P: Introduction to Programming with Python', provider: 'Harvard CS50', type: 'Free Resource', url: 'https://cs50.harvard.edu/python/' },
      { title: 'Automate the Boring Stuff with Python', provider: 'Al Sweigart', type: 'Course', url: 'https://automatetheboringstuff.com/' },
    ],
    practicePrompts: [
      'Write a function that accepts two lists of skills and returns matched, missing, and extra skills case-insensitively.',
      'Implement a word-frequency counter on a multi-line resume string ignoring common stop words.',
      'Build a decorator that measures and logs the execution time of any Python function.',
    ],
    quizQuestions: [
      {
        id: 'py-q1',
        kind: 'mcq',
        topic: 'Data Structures',
        difficulty: 'beginner',
        prompt: 'Which Python built-in collection automatically removes duplicate elements and supports fast membership checks?',
        options: ['list', 'tuple', 'set', 'dict.values()'],
        correctIndex: 2,
        explanation: 'A Python set stores unique hashable elements and supports O(1) average-time membership testing with `in`.',
      },
      {
        id: 'py-q2',
        kind: 'true_false',
        topic: 'Functions & Arguments',
        difficulty: 'beginner',
        prompt: 'True or False: Using a mutable list `items=[]` as a default function parameter shares the same list across calls.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Default argument values in Python are evaluated once when the `def` statement executes, so mutable defaults persist across calls.',
      },
      {
        id: 'py-q3',
        kind: 'coding',
        topic: 'List Comprehension',
        difficulty: 'intermediate',
        prompt: 'What is the output of this Python snippet?',
        codeSnippet: `nums = [1, 2, 3, 4, 5]\nresult = [n * n for n in nums if n % 2 == 0]\nprint(result)`,
        options: ['[1, 9, 25]', '[4, 16]', '[2, 4]', '[4, 9, 16]'],
        correctIndex: 1,
        explanation: 'Only even numbers (2 and 4) pass `n % 2 == 0`, and each is squared to yield [4, 16].',
      },
      {
        id: 'py-q4',
        kind: 'technical',
        topic: 'File Handling & Safety',
        difficulty: 'intermediate',
        prompt: 'Why is `with open(path, "r") as f:` preferred over `f = open(path, "r")`?',
        options: [
          'It compiles the file into bytecode automatically',
          'It guarantees the file handle is closed even if an exception occurs',
          'It loads the file asynchronously in a background thread',
          'It bypasses operating system file permissions',
        ],
        correctIndex: 1,
        explanation: 'The `with` statement uses Python context manager protocol (`__exit__`) to close the file descriptor reliably on normal exit or error.',
      },
      {
        id: 'py-q5',
        kind: 'technical',
        topic: 'Object-Oriented Python',
        difficulty: 'advanced',
        prompt: 'What does `@dataclass(frozen=True)` enforce on instances of a class?',
        options: [
          'Instances cannot be serialized to JSON',
          'Instances are read-only and raise FrozenInstanceError on attribute reassignment',
          'All methods inside the class become static methods',
          'The class cannot inherit from any base class',
        ],
        correctIndex: 1,
        explanation: 'Setting `frozen=True` makes dataclass attributes immutable after initialization and generates a `__hash__` if all fields are hashable.',
      },
    ],
  },
  {
    id: 'data-analytics',
    slug: 'data-analytics',
    number: '02',
    title: 'Data Analytics',
    category: 'Data & Business Intelligence',
    tagline: 'Turn raw operational datasets into clear SQL queries, KPI dashboards, and business decisions.',
    introduction:
      'Data Analysts bridge raw business data and executive decision-making. You will learn how to clean messy spreadsheets, write analytical SQL queries, aggregate metrics with Pandas, and communicate insights through clear charts.',
    prerequisites: [
      'Comfort with basic arithmetic and percentages',
      'Basic familiarity with spreadsheets (Excel or Google Sheets)',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Spreadsheet Modeling & Analytical Thinking',
        milestones: ['Pivot tables, XLOOKUP, and data cleaning formulas', 'Define clear North Star metrics and funnel conversion rates'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'SQL Mastery for Analytics',
        milestones: ['Write SELECT, JOIN, GROUP BY, and HAVING queries', 'Apply window functions (RANK, LAG, running totals)'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Python Pandas & BI Storytelling',
        milestones: ['Clean missing values and outliers in Pandas', 'Build executive-ready KPI visualizations'],
      },
    ],
    modules: [
      {
        id: 'da-mod-1',
        title: 'Analytical SQL & Aggregations',
        level: 'Beginner',
        estimatedHours: 8,
        overview: 'Query relational tables, join datasets accurately, and avoid double-counting traps.',
        lessons: [
          {
            id: 'da-l1',
            title: 'GROUP BY, Joins & Window Functions',
            durationMinutes: 35,
            summary: 'Compute cohort retention and department hiring velocity directly in SQL.',
            steps: [
              'Filter raw rows using WHERE before grouping, and filter aggregated groups with HAVING.',
              'Use LEFT JOIN to preserve unmatched records when auditing drop-offs.',
              'Compute running totals and rankings using OVER (PARTITION BY ... ORDER BY ...).',
            ],
            practicalExample: 'Ranking top hiring departments by average time-to-offer.',
            codeExample: {
              language: 'sql',
              code: `SELECT
  department,
  COUNT(*) AS total_hires,
  ROUND(AVG(days_to_offer), 1) AS avg_days,
  RANK() OVER (ORDER BY AVG(days_to_offer) ASC) AS speed_rank
FROM hiring_funnel
WHERE status = 'hired'
GROUP BY department
HAVING COUNT(*) >= 5;`,
            },
          },
        ],
      },
      {
        id: 'da-mod-2',
        title: 'Data Cleaning & Exploration in Pandas',
        level: 'Intermediate',
        estimatedHours: 8,
        overview: 'Handle missing values, standardize categories, and summarize distributions in Python.',
        lessons: [
          {
            id: 'da-l2',
            title: 'DataFrames, Groupby & Missing Data Audit',
            durationMinutes: 30,
            summary: 'Audit dataset quality before plotting any chart so conclusions remain trustworthy.',
            steps: [
              'Inspect shape, dtypes, and null counts with df.info() and df.isna().sum().',
              'Normalize inconsistent text labels with .str.strip().str.lower().',
              'Aggregate multiple metrics cleanly with df.groupby(...).agg(...).',
            ],
            practicalExample: 'Cleaning candidate salary survey data before calculating median compensation.',
            codeExample: {
              language: 'python',
              code: `import pandas as pd

df = pd.DataFrame({
    "role": ["Data Analyst", "data analyst ", "ML Engineer"],
    "salary_usd": [78000, 82000, 135000]
})
df["role_clean"] = df["role"].str.strip().str.title()
summary = df.groupby("role_clean")["salary_usd"].agg(["count", "median", "mean"])
print(summary)`,
            },
          },
        ],
      },
      {
        id: 'da-mod-3',
        title: 'KPI Design & Stakeholder Dashboards',
        level: 'Advanced',
        estimatedHours: 6,
        overview: 'Select appropriate chart encodings and avoid misleading visual distortions.',
        lessons: [
          {
            id: 'da-l3',
            title: 'Choosing Charts & Avoiding Visual Distortion',
            durationMinutes: 25,
            summary: 'Match every question to the clearest visual encoding and baseline axis.',
            steps: [
              'Use bar charts starting at zero for categorical comparisons.',
              'Use line charts for continuous time trends rather than unordered categories.',
              'Always label units, timeframe, and sample size directly on the dashboard.',
            ],
            practicalExample: 'Designing a quarterly job-application conversion funnel report.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'da-proj-1',
        title: 'E-Commerce Funnel & Cohort Drop-Off Audit',
        difficulty: 'Beginner',
        description: 'Analyze checkout event logs in SQL to locate the highest-friction stage and quantify revenue recovery.',
        deliverables: ['Annotated SQL script', 'Funnel conversion table', '3 actionable recommendations'],
        skillsPracticed: ['SQL', 'Window Functions', 'Funnel Analysis'],
      },
      {
        id: 'da-proj-2',
        title: 'Tech Salary & Skill Demand Exploratory Report',
        difficulty: 'Intermediate',
        description: 'Clean a multi-country job posting dataset in Pandas and chart median salary by experience tier.',
        deliverables: ['Jupyter notebook', 'Outlier cleaning log', 'Matplotlib/Seaborn summary charts'],
        skillsPracticed: ['Pandas', 'Data Cleaning', 'Visualization'],
      },
    ],
    resources: [
      { title: 'SQLBolt Interactive SQL Lessons', provider: 'SQLBolt', type: 'Free Resource', url: 'https://sqlbolt.com/' },
      { title: 'Pandas Official Getting Started', provider: 'PyData', type: 'Documentation', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
      { title: 'Data Analytics Full Course', provider: 'freeCodeCamp', type: 'Video', url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8' },
      { title: 'Kaggle Learn: Pandas & SQL', provider: 'Kaggle', type: 'Course', url: 'https://www.kaggle.com/learn' },
    ],
    practicePrompts: [
      'Write a SQL query using LAG() to compute month-over-month user signup growth percentage.',
      'Identify why averaging already-averaged percentages across uneven group sizes produces Simpson’s paradox.',
    ],
    quizQuestions: [
      {
        id: 'da-q1',
        kind: 'mcq',
        topic: 'SQL Filtering',
        difficulty: 'beginner',
        prompt: 'Which SQL clause filters grouped results after `GROUP BY` has been computed?',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'],
        correctIndex: 1,
        explanation: 'WHERE filters individual rows before aggregation, whereas HAVING filters groups created by GROUP BY.',
      },
      {
        id: 'da-q2',
        kind: 'true_false',
        topic: 'Statistics for Analytics',
        difficulty: 'beginner',
        prompt: 'True or False: When salary data has extreme high-income outliers, the median is more representative of a typical earner than the mean.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'The mean is sensitive to extreme skew, whereas the median reflects the 50th percentile middle observation.',
      },
      {
        id: 'da-q3',
        kind: 'coding',
        topic: 'Pandas',
        difficulty: 'intermediate',
        prompt: 'Which Pandas expression counts non-null values in every column of DataFrame `df`?',
        options: ['df.count()', 'df.isna()', 'df.shape()', 'df.unique()'],
        correctIndex: 0,
        explanation: '`df.count()` returns the number of non-NA/null observations per column.',
      },
      {
        id: 'da-q4',
        kind: 'technical',
        topic: 'SQL Joins',
        difficulty: 'intermediate',
        prompt: 'If Table A has 100 rows and you run `A LEFT JOIN B` where each row in A matches 2 rows in B, how many rows are returned?',
        options: ['100 rows', '50 rows', '200 rows', '0 rows'],
        correctIndex: 2,
        explanation: 'A one-to-many join duplicates the left row for each matching right row, resulting in 200 rows.',
      },
    ],
  },
  {
    id: 'data-science',
    slug: 'data-science',
    number: '03',
    title: 'Data Science',
    category: 'Data & Statistical Modeling',
    tagline: 'Combine statistical inference, hypothesis testing, NumPy/Pandas, and predictive experimentation.',
    introduction:
      'Data Science goes beyond descriptive reporting to answer why outcomes happen and what will happen next. You will master probability distributions, A/B hypothesis testing, feature engineering, and reproducible analytical notebooks.',
    prerequisites: [
      'Basic Python programming (loops, functions, dictionaries)',
      'High-school algebra and basic probability intuition',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Scientific Python & Numerical Computing',
        milestones: ['Vectorized array operations with NumPy', 'Exploratory Data Analysis (EDA) & correlation checks'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Probability & A/B Experimentation',
        milestones: ['Confidence intervals, p-values, statistical power', 'Design and analyze a product A/B test'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Feature Engineering & Statistical Modeling',
        milestones: ['Linear & logistic regression diagnostics', 'Cross-validation and leakage prevention'],
      },
    ],
    modules: [
      {
        id: 'ds-mod-1',
        title: 'Vectorized Computing with NumPy',
        level: 'Beginner',
        estimatedHours: 6,
        overview: 'Replace slow Python loops with vectorized matrix and statistical computations.',
        lessons: [
          {
            id: 'ds-l1',
            title: 'NumPy Broadcasting & Summary Statistics',
            durationMinutes: 30,
            summary: 'Normalize feature vectors and compute z-scores cleanly using broadcasting.',
            steps: [
              'Construct typed ndarrays and inspect .shape and .dtype.',
              'Compute column-wise mean and standard deviation with axis=0.',
              'Standardize features with (X - mean) / std without explicit loops.',
            ],
            practicalExample: 'Z-score normalizing candidate assessment metrics across cohorts.',
            codeExample: {
              language: 'python',
              code: `import numpy as np

scores = np.array([[80, 12], [92, 18], [68, 9], [85, 15]], dtype=float)
z_scores = (scores - scores.mean(axis=0)) / scores.std(axis=0)
print(np.round(z_scores, 2))`,
            },
          },
        ],
      },
      {
        id: 'ds-mod-2',
        title: 'Hypothesis Testing & A/B Experimentation',
        level: 'Intermediate',
        estimatedHours: 8,
        overview: 'Evaluate product experiments rigorously using t-tests, chi-square tests, and confidence intervals.',
        lessons: [
          {
            id: 'ds-l2',
            title: 'Running Two-Sample Significance Tests',
            durationMinutes: 35,
            summary: 'Determine whether observed conversion lift is real signal or random sampling noise.',
            steps: [
              'State null (H0) and alternative (H1) hypotheses before peeking at results.',
              'Compute sample size and minimum detectable effect ahead of launch.',
              'Evaluate both statistical significance (p-value) and practical effect size.',
            ],
            practicalExample: 'Testing whether a new onboarding checklist improves 7-day learner retention.',
            codeExample: {
              language: 'python',
              code: `from scipy import stats

control = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
treatment = [1, 1, 0, 1, 1, 0, 1, 1, 0, 1]
t_stat, p_val = stats.ttest_ind(treatment, control, equal_var=False)
print(f"t={t_stat:.3f}, p={p_val:.4f}")`,
            },
          },
        ],
      },
      {
        id: 'ds-mod-3',
        title: 'Regression Modeling & Validation',
        level: 'Advanced',
        estimatedHours: 10,
        overview: 'Interpret regression coefficients, avoid multicollinearity, and prevent train-test data leakage.',
        lessons: [
          {
            id: 'ds-l3',
            title: 'Preventing Data Leakage in Feature Pipelines',
            durationMinutes: 35,
            summary: 'Ensure scalers and encoders are fit exclusively on training folds.',
            steps: [
              'Split training and holdout sets before computing any summary statistics.',
              'Wrap preprocessing steps inside a Pipeline object.',
              'Inspect residual plots to verify linearity and homoscedasticity.',
            ],
            practicalExample: 'Predicting expected course completion time without future-feature leakage.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'ds-proj-1',
        title: 'Product A/B Test Power & Outcome Simulator',
        difficulty: 'Intermediate',
        description: 'Compute required sample sizes and evaluate simulated conversion rates with bootstrap confidence intervals.',
        deliverables: ['Python statistical notebook', 'Effect size & p-value summary', 'Launch decision memo'],
        skillsPracticed: ['SciPy', 'Hypothesis Testing', 'Bootstrap CI'],
      },
    ],
    resources: [
      { title: 'NumPy User Guide', provider: 'NumPy.org', type: 'Documentation', url: 'https://numpy.org/doc/stable/user/' },
      { title: 'StatQuest: Statistics Fundamentals', provider: 'StatQuest', type: 'Video', url: 'https://www.youtube.com/c/joshstarmer' },
      { title: 'Think Stats (Free Book)', provider: 'Allen B. Downey', type: 'Free Resource', url: 'https://greenteapress.com/wp/think-stats-2e/' },
      { title: 'Intro to Data Science', provider: 'Kaggle Learn', type: 'Course', url: 'https://www.kaggle.com/learn' },
    ],
    practicePrompts: [
      'Explain why fitting a StandardScaler on the full dataset before train_test_split leaks test distribution information.',
      'Calculate a 95% confidence interval for a proportion of 140 successes out of 200 trials.',
    ],
    quizQuestions: [
      {
        id: 'ds-q1',
        kind: 'mcq',
        topic: 'Experimentation',
        difficulty: 'beginner',
        prompt: 'What does a p-value of 0.03 represent in an A/B test?',
        options: [
          'There is a 97% chance the business will make money',
          'Assuming the null hypothesis is true, there is a 3% probability of observing data at least this extreme',
          '3% of users preferred variant B',
          'The treatment effect is guaranteed to be 3%',
        ],
        correctIndex: 1,
        explanation: 'A p-value measures how compatible the observed data is with the null hypothesis assuming no true difference.',
      },
      {
        id: 'ds-q2',
        kind: 'true_false',
        topic: 'Data Leakage',
        difficulty: 'intermediate',
        prompt: 'True or False: Imputing missing values using the median of the entire dataset before splitting into train and test sets causes data leakage.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Information from the test split influences the imputed values in the training split; imputation parameters must be learned only from the training set.',
      },
      {
        id: 'ds-q3',
        kind: 'coding',
        topic: 'NumPy',
        difficulty: 'beginner',
        prompt: 'What shape does `np.zeros((3, 4)).sum(axis=0)` return?',
        options: ['(3,)', '(4,)', '(3, 4)', 'Scalar 0'],
        correctIndex: 1,
        explanation: 'Summing along `axis=0` collapses the 3 rows and produces one sum per each of the 4 columns: shape `(4,)`.',
      },
      {
        id: 'ds-q4',
        kind: 'technical',
        topic: 'Statistical Modeling',
        difficulty: 'advanced',
        prompt: 'Why is R-squared alone insufficient to compare a 2-feature linear model with a 20-feature model?',
        options: [
          'R-squared decreases whenever features are added',
          'R-squared never decreases when adding features, even random noise; Adjusted R-squared or CV error is needed',
          'R-squared only applies to classification',
          'R-squared requires categorical target variables',
        ],
        correctIndex: 1,
        explanation: 'Adding arbitrary predictors artificially inflates training R-squared; cross-validation error or Adjusted R-squared penalizes unnecessary complexity.',
      },
    ],
  },
  {
    id: 'machine-learning',
    slug: 'machine-learning',
    number: '04',
    title: 'Machine Learning',
    category: 'AI & Predictive Systems',
    tagline: 'Build, evaluate, tune, and deploy supervised and unsupervised ML pipelines using Scikit-learn.',
    introduction:
      'Machine Learning enables software systems to learn patterns from data rather than hard-coded rules. You will master classification, regression, clustering, hyperparameter tuning, and production model evaluation.',
    prerequisites: [
      'Python programming and NumPy/Pandas basics',
      'Core statistics and train/test validation concepts',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'Supervised Learning Foundations',
        milestones: ['Train Linear/Logistic Regression and Decision Trees', 'Understand bias-variance tradeoff and regularization'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Ensemble Methods & Evaluation',
        milestones: ['Master Random Forests and Gradient Boosting (XGBoost/LightGBM)', 'Use Precision, Recall, F1, and ROC-AUC on imbalanced data'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Unsupervised Learning & Deployment',
        milestones: ['Apply K-Means clustering and PCA dimensionality reduction', 'Serialize Scikit-learn Pipelines and serve predictions via FastAPI'],
      },
    ],
    modules: [
      {
        id: 'ml-mod-1',
        title: 'End-to-End Scikit-learn Pipelines',
        level: 'Beginner',
        estimatedHours: 8,
        overview: 'Combine ColumnTransformer preprocessing and estimators cleanly without leakage.',
        lessons: [
          {
            id: 'ml-l1',
            title: 'Building a Classification Pipeline',
            durationMinutes: 35,
            summary: 'Preprocess numeric and categorical columns cleanly inside a unified Pipeline.',
            steps: [
              'Separate numeric and categorical features using ColumnTransformer.',
              'Apply SimpleImputer + StandardScaler to numeric columns and OneHotEncoder to categories.',
              'Fit the entire pipeline on X_train and evaluate on X_test.',
            ],
            practicalExample: 'Predicting whether a job seeker will receive an interview callback from profile attributes.',
            codeExample: {
              language: 'python',
              code: `from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

pre = ColumnTransformer([
    ("num", StandardScaler(), ["years_exp", "projects_count"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["primary_track"]),
])

clf = Pipeline([("pre", pre), ("model", RandomForestClassifier(n_estimators=200, random_state=42))])`,
            },
          },
        ],
      },
      {
        id: 'ml-mod-2',
        title: 'Imbalanced Metrics & Hyperparameter Tuning',
        level: 'Intermediate',
        estimatedHours: 8,
        overview: 'Move beyond raw accuracy and optimize models systematically with cross-validation.',
        lessons: [
          {
            id: 'ml-l2',
            title: 'Precision, Recall, PR-AUC & Stratified CV',
            durationMinutes: 30,
            summary: 'Evaluate rare-event classifiers accurately when positive labels are under 5%.',
            steps: [
              'Use StratifiedKFold so every fold preserves class proportions.',
              'Inspect confusion matrices and tune decision thresholds for business cost.',
              'Use RandomizedSearchCV or Optuna over bounded search spaces.',
            ],
            practicalExample: 'Optimizing fraud or churn detection recall at a fixed false-positive budget.',
          },
        ],
      },
      {
        id: 'ml-mod-3',
        title: 'Deep Learning Foundations & Model Serving',
        level: 'Advanced',
        estimatedHours: 10,
        overview: 'Transition from tabular tree ensembles to neural networks and serialized REST endpoints.',
        lessons: [
          {
            id: 'ml-l3',
            title: 'Saving & Serving Trained Pipelines',
            durationMinutes: 35,
            summary: 'Export verified Scikit-learn artifacts with joblib and wrap them in strict schema validation.',
            steps: [
              'Persist the entire Pipeline (including preprocessing) via joblib.dump.',
              'Validate inference payloads with Pydantic before calling model.predict_proba.',
              'Log prediction latency and feature drift metrics in production.',
            ],
            practicalExample: 'Serving a real-time salary band estimator behind a REST endpoint.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'ml-proj-1',
        title: 'Customer Churn Prediction Pipeline',
        difficulty: 'Intermediate',
        description: 'Compare Logistic Regression, Random Forest, and Gradient Boosting using Stratified CV and F1/ROC-AUC.',
        deliverables: ['Leak-free Scikit-learn Pipeline', 'Feature importance analysis', 'Confusion matrix report'],
        skillsPracticed: ['Scikit-learn', 'Cross-Validation', 'Feature Engineering'],
      },
    ],
    resources: [
      { title: 'Scikit-learn User Guide', provider: 'Scikit-learn.org', type: 'Documentation', url: 'https://scikit-learn.org/stable/user_guide.html' },
      { title: 'Machine Learning Specialization Overview', provider: 'DeepLearning.AI', type: 'Course', url: 'https://www.deeplearning.ai/courses/machine-learning-specialization/' },
      { title: 'Hands-On Machine Learning (Scikit-learn Tutorials)', provider: 'Kaggle Learn', type: 'Free Resource', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
      { title: 'StatQuest Machine Learning Playlist', provider: 'StatQuest', type: 'Video', url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF' },
    ],
    practicePrompts: [
      'Explain why accuracy is misleading on a 99:1 imbalanced dataset and which metric you should use instead.',
      'Compare L1 (Lasso) and L2 (Ridge) regularization effects on correlated feature weights.',
    ],
    quizQuestions: [
      {
        id: 'ml-q1',
        kind: 'mcq',
        topic: 'Model Evaluation',
        difficulty: 'beginner',
        prompt: 'In a cancer screening classifier where missing a positive case is very costly, which metric should you prioritize?',
        options: ['Specificity', 'Recall (Sensitivity)', 'Training Accuracy', 'R-squared'],
        correctIndex: 1,
        explanation: 'Recall measures TP / (TP + FN), ensuring true positive cases are rarely missed.',
      },
      {
        id: 'ml-q2',
        kind: 'true_false',
        topic: 'Overfitting',
        difficulty: 'beginner',
        prompt: 'True or False: A model with 99% training accuracy and 62% validation accuracy is suffering from high variance (overfitting).',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'A large gap between high training performance and poor validation performance is the classic signature of overfitting.',
      },
      {
        id: 'ml-q3',
        kind: 'technical',
        topic: 'Pipelines',
        difficulty: 'intermediate',
        prompt: 'Why should `OneHotEncoder(handle_unknown="ignore")` be configured in production ML pipelines?',
        options: [
          'It speeds up GPU matrix multiplication',
          'It prevents runtime crashes when an unseen category appears during inference',
          'It automatically deletes missing rows',
          'It converts regression targets into classes',
        ],
        correctIndex: 1,
        explanation: 'Unseen categorical values at inference time raise a ValueError by default unless `handle_unknown="ignore"` is set.',
      },
      {
        id: 'ml-q4',
        kind: 'technical',
        topic: 'Tree Ensembles',
        difficulty: 'advanced',
        prompt: 'How does Gradient Boosting differ fundamentally from Random Forest?',
        options: [
          'Random Forest trains trees sequentially on residuals; Gradient Boosting trains independent trees in parallel',
          'Gradient Boosting builds trees sequentially to correct prior residual errors; Random Forest averages independent bootstrapped trees',
          'Gradient Boosting only works for unsupervised clustering',
          'Random Forest cannot handle numeric features',
        ],
        correctIndex: 1,
        explanation: 'Bagging (Random Forest) reduces variance by averaging parallel independent trees; Boosting trains trees sequentially to reduce bias on residuals.',
      },
    ],
  },
  {
    id: 'ai-engineering-genai',
    slug: 'ai-engineering-genai',
    number: '05',
    title: 'AI Engineering and Generative AI',
    category: 'AI & LLM Systems',
    tagline: 'Design structured LLM workflows, RAG architectures, vector search, function calling, and evaluation harnesses.',
    introduction:
      'AI Engineers build production software powered by foundation models. Rather than treating prompts as magic strings, you will learn structured JSON schemas, Retrieval-Augmented Generation (RAG), tool use, grounded citations, and automated evaluation.',
    prerequisites: [
      'Solid Python or TypeScript proficiency',
      'Familiarity with REST APIs and JSON schemas',
    ],
    roadmapPhases: [
      {
        phase: 'Phase 1 · Weeks 1–2',
        title: 'LLM APIs & Structured Outputs',
        milestones: ['Master system instructions and deterministic JSON schemas', 'Handle streaming responses, retries, and latency budgets'],
      },
      {
        phase: 'Phase 2 · Weeks 3–4',
        title: 'Embeddings, Vector Databases & RAG',
        milestones: ['Chunk documents with overlap and metadata preservation', 'Implement hybrid vector + keyword retrieval with citations'],
      },
      {
        phase: 'Phase 3 · Weeks 5–6',
        title: 'Agents, Tool Calling & Evals',
        milestones: ['Implement safe server-side function calling tools', 'Build regression evaluation suites to catch hallucinations'],
      },
    ],
    modules: [
      {
        id: 'ai-mod-1',
        title: 'Structured Outputs & Prompt Architecture',
        level: 'Beginner',
        estimatedHours: 6,
        overview: 'Enforce strict JSON contracts and defensive grounding rules in model calls.',
        lessons: [
          {
            id: 'ai-l1',
            title: 'Schema-Constrained Generation with @google/genai',
            durationMinutes: 30,
            summary: 'Force reliable structured JSON output for downstream UI rendering and database storage.',
            steps: [
              'Always keep API keys and @google/genai calls strictly inside server routes.',
              'Define responseMimeType: "application/json" alongside a strict responseSchema.',
              'Instruct the model to ground claims exclusively in provided context.',
            ],
            practicalExample: 'Extracting verified technical skills from a candidate resume without fabrication.',
            codeExample: {
              language: 'typescript',
              code: `import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-4-hydrogen",
  contents: "Analyze this skill list: Python, FastAPI, PostgreSQL",
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
  },
});`,
            },
          },
        ],
      },
      {
        id: 'ai-mod-2',
        title: 'Retrieval-Augmented Generation (RAG)',
        level: 'Intermediate',
        estimatedHours: 10,
        overview: 'Index private knowledge bases with embeddings, retrieve relevant chunks, and cite sources.',
        lessons: [
          {
            id: 'ai-l2',
            title: 'Chunking Strategies & Cosine Similarity Search',
            durationMinutes: 40,
            summary: 'Avoid broken mid-sentence splits and combine semantic embeddings with metadata filtering.',
            steps: [
              'Split long documents into 300–600 token chunks with 15% sliding overlap.',
              'Embed chunks with an embedding model and store normalized vectors.',
              'Inject top-k retrieved chunks into the prompt with explicit source IDs.',
            ],
            practicalExample: 'Building a grounded engineering handbook Q&A assistant.',
          },
        ],
      },
      {
        id: 'ai-mod-3',
        title: 'Tool Calling, Guardrails & Evals',
        level: 'Advanced',
        estimatedHours: 8,
        overview: 'Measure faithfulness, prevent prompt injection, and orchestrate multi-step tool execution.',
        lessons: [
          {
            id: 'ai-l3',
            title: 'Automated Eval Suites for LLM Pipelines',
            durationMinutes: 35,
            summary: 'Test prompts against golden datasets before deploying model or schema changes.',
            steps: [
              'Assemble 30–50 representative test cases including adversarial edge cases.',
              'Score schema validity, citation accuracy, and refusal behavior automatically.',
              'Track latency and token cost per workflow step.',
            ],
            practicalExample: 'Evaluating a resume-to-job matching pipeline against human rubric scores.',
          },
        ],
      },
    ],
    miniProjects: [
      {
        id: 'ai-proj-1',
        title: 'Citation-Grounded Technical Docs Assistant',
        difficulty: 'Intermediate',
        description: 'Ingest markdown documentation, generate embeddings, and answer developer queries with clickable source citations.',
        deliverables: ['Chunking & embedding script', 'Top-k cosine retriever', 'Grounded answer API route'],
        skillsPracticed: ['Embeddings', 'RAG', 'Structured JSON'],
      },
    ],
    resources: [
      { title: 'Google AI for Developers (Gemini API Docs)', provider: 'Google AI', type: 'Documentation', url: 'https://ai.google.dev/gemini-api/docs' },
      { title: 'Prompt Engineering Guide', provider: 'DAIR.AI', type: 'Free Resource', url: 'https://www.promptingguide.ai/' },
      { title: 'Building Systems with Chat & RAG', provider: 'DeepLearning.AI', type: 'Course', url: 'https://www.deeplearning.ai/short-courses/' },
      { title: 'Intro to Large Language Models', provider: 'Andrej Karpathy', type: 'Video', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' },
    ],
    practicePrompts: [
      'Design a JSON schema for extracting structured job requirements while separating required vs. preferred skills.',
      'Explain how hybrid search (BM25 + dense vector embeddings) improves retrieval of exact error codes and acronyms.',
    ],
    quizQuestions: [
      {
        id: 'ai-q1',
        kind: 'mcq',
        topic: 'RAG Architecture',
        difficulty: 'beginner',
        prompt: 'Why is Retrieval-Augmented Generation (RAG) used instead of relying solely on model pretraining weights?',
        options: [
          'RAG eliminates the need for an API key',
          'RAG grounds responses in up-to-date, private, or domain-specific source documents with citations',
          'RAG permanently fine-tunes the foundation model on every user query',
          'RAG compresses images into audio streams',
        ],
        correctIndex: 1,
        explanation: 'RAG retrieves relevant external context at query time so the model answers from current, verifiable documents.',
      },
      {
        id: 'ai-q2',
        kind: 'true_false',
        topic: 'Security & Architecture',
        difficulty: 'beginner',
        prompt: 'True or False: LLM API keys should always remain on server-side endpoints rather than bundled into browser JavaScript.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Client-side bundles can be inspected by any visitor; server-side routes keep credentials private and enforce rate/input validation.',
      },
      {
        id: 'ai-q3',
        kind: 'technical',
        topic: 'Chunking',
        difficulty: 'intermediate',
        prompt: 'Why do RAG ingestion pipelines include token overlap (e.g., 10–15%) between consecutive text chunks?',
        options: [
          'To double vector database storage billing',
          'To preserve context for sentences or concepts spanning a chunk boundary',
          'To encrypt the embeddings',
          'To remove punctuation automatically',
        ],
        correctIndex: 1,
        explanation: 'Overlap prevents splitting key context across two disconnected chunks at arbitrary character/token boundaries.',
      },
      {
        id: 'ai-q4',
        kind: 'technical',
        topic: 'Evaluation',
        difficulty: 'advanced',
        prompt: 'Which failure mode occurs when an LLM generates plausible-sounding statements contradicted by the retrieved context?',
        options: ['Tokenization drift', 'Unfaithful hallucination', 'Gradient vanishing', 'Cold start'],
        correctIndex: 1,
        explanation: 'Faithfulness evaluates whether every claim in the output is directly supported by the provided retrieved passages.',
      },
    ],
  },
];
