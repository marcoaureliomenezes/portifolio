from rand_engine import DataGenerator

spec = {
    "user_id": {"method": "int_zfilled", "kwargs": {"length": 8}},
    "age": {"method": "integers", "kwargs": {"min": 18, "max": 80}},
    "plan": {"method": "distincts_prop", "kwargs": {"distincts": {"free": 8, "pro": 2}}},
    "signup": {"method": "dates", "kwargs": {"start": "2024-01-01", "end": "2024-12-31"}},
}

df = DataGenerator(spec, seed=42).size(1_000).get_df()
print(df.head())
