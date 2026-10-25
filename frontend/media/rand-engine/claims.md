# Claims at tag 0.8.0 (11117472d11a42ed7e1bf8f5405e180232bfd377)

Every sentence a rand-engine scene prints or draws. `claim | file:line at the tag`.

| claim | file:line at the tag |
|---|---|
| A spec maps each column to a `method` and its `kwargs`. | `README.md:19` |
| The seed makes the output reproducible. | `README.md:19`, `rand_engine/main/data_generator.py:27` |
| `DataGenerator(spec, seed=…).size(n).get_df()` returns a DataFrame. | `README.md:31` |
| `integers` takes `min` and `max`. | `docs/1_DATA_GENERATOR.md:11` |
| `distincts` samples from a list of values. | `docs/3_WRITING_FILES.md:13` |
| `int_zfilled` takes `length`; `distincts_prop` takes weights; `dates` takes `start` and `end` (the try-it example). | `README.md:23-28` |
| `write.format("csv").options(numFiles=3).save(path)` writes a batch. | `docs/3_WRITING_FILES.md:19` (`options(numFiles=…)`), `:63` |
| With `numFiles` above 1, `path` is a folder of `part_<id>.<ext>` files. | `docs/3_WRITING_FILES.md:63` |
| `pk` values never repeat between parts. | `docs/3_WRITING_FILES.md:69` |
| `pk` takes `start`. | `docs/3_WRITING_FILES.md:11` |
| `customers` and `orders` are the two related tables of the example. | `docs/4_CONSTRAINTS.md:12,17`, `docs/5_RECIPES.md:155-162` |
| `customer_id` is the `pk` of `customers`, a sequence from `start: 1`. | `docs/4_CONSTRAINTS.md:10` |
| A `pk` value is a pure function of its kwargs and row index; an `fk` value is a function of its parent's `pk` definition. | `docs/4_CONSTRAINTS.md:3-5` |
| `city` is a `distincts` column with the values `Rio` and `Recife`. | `docs/4_CONSTRAINTS.md:14` |
| `order_id` is the `pk` of `orders`, a sequence from `start: 1`. | `docs/4_CONSTRAINTS.md:18` |
| `orders.customer_id` is an `fk` whose `parent` is the `customer_id` `pk` spec. | `docs/4_CONSTRAINTS.md:19` |
| Related tables share the parent's `pk` spec with the child's `fk`, so `pk` and `fk` stay consistent. | `README.md:38`, `docs/5_RECIPES.md:152` |
| The drawn row ids (1, 2, 3), the `orders` rows and the `fk` values are illustrative, not printed output. | `docs/4_CONSTRAINTS.md:10,18` (both `pk` sequences start at 1) |
| `DataGenerator(spec, seed=1)` builds the generator, and `.size(10)` sets the rows per stream microbatch. | `docs/1_DATA_GENERATOR.md:25-26` |
| `.stream_dict(min_throughput, max_throughput)` yields an infinite generator of dicts. | `docs/1_DATA_GENERATOR.md:29` |
| `stream_dict` never ends; the caller stops it. | `docs/1_DATA_GENERATOR.md:269-270` |
| Each `stream_dict` record gains a `timestamp_created` field (epoch seconds). | `docs/1_DATA_GENERATOR.md:269-270` |
| `event_id` is a `pk` that continues across microbatches, so its values never repeat. | `docs/4_CONSTRAINTS.md:120-127` |
