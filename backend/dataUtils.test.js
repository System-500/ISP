const { cleanAndSortData } = require('./dataUtils');

test('should correctly correct year "2" to 2020 and sort chronologically', () => {

    const mockExcelRows = [
        { "Nr tygodnia": 2, "2021": 500, "2": 400 },
        { "Nr tygodnia": 1, "2021": 450, "2": 350 }
    ];

    const result = cleanAndSortData(mockExcelRows);

    expect(result).toHaveLength(4);

    expect(result[0]).toEqual({ rok: 2020, tydzien: 1, zgony: 350 });

    expect(result[1]).toEqual({ rok: 2020, tydzien: 2, zgony: 400 });

    expect(result[2]).toEqual({ rok: 2021, tydzien: 1, zgony: 450 });
});

test('should completely skip rows with a malformed week number', () => {
    const badData = [
        { "Nr tygodnia": "Tydzień 1", "2026": 4000 }
    ];

    const result = cleanAndSortData(badData);
    expect(result).toHaveLength(0);
});