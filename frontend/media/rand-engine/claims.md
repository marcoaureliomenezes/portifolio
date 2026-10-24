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
