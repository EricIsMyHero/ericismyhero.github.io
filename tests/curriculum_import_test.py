import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('curriculum_import', ROOT / 'tools/import-curriculum-pdfs.py')
IMPORT = importlib.util.module_from_spec(spec)
spec.loader.exec_module(IMPORT)
FIXTURES = json.loads((ROOT / 'tests/fixtures/curriculum-tables.json').read_text())


class CurriculumImportTests(unittest.TestCase):
    def test_real_multi_page_plans_and_elective_groups(self):
        for key, fixture in FIXTURES.items():
            rows = IMPORT.parse_tables(fixture['pages'])
            self.assertEqual(len(rows), 40, key)
            self.assertEqual(sum(row['credit'] for row in rows), 240)
            self.assertEqual(sum(row['section'] == 'majorElectives' for row in rows), 10)
            self.assertEqual(next(row for row in rows if row['codes'] == ['01222'])['semester'], 1)
        rows = IMPORT.parse_tables(FIXTURES['management']['pages'])
        self.assertEqual(next(row for row in rows if row['codes'] == ['00016'])['name'], 'İKT - baza kompyüter bilikləri')
        self.assertEqual(next(row for row in rows if row['codes'][0] == '00531')['credit'], 6)

    def test_missing_rows_are_rejected_instead_of_publishing_a_partial_plan(self):
        pages = copy.deepcopy(FIXTURES['management']['pages'])
        for page in pages:
            for table in page:
                table[:] = [row for row in table if '00837' not in row]
        with self.assertRaises(ValueError):
            IMPORT.parse_tables(pages)

    def test_invalid_semester_and_shifted_numeric_columns_are_rejected(self):
        for field, value in [(12, 'P–9'), (6, '61')]:
            pages = copy.deepcopy(FIXTURES['management']['pages'])
            for page in pages:
                for table in page:
                    for row in table:
                        if '00837' in row:
                            cells = [x for x in row if x is not None]
                            cells[field] = value
                            row[:] = cells
            with self.assertRaises(ValueError):
                IMPORT.parse_tables(pages)


if __name__ == '__main__':
    unittest.main()
