function cleanAndSortData(rawRows) {
    const flattenedData = [];

    rawRows.forEach(row => {
        const tydzien = parseInt(row['Nr tygodnia']);
        if (isNaN(tydzien)) return;

        Object.keys(row).forEach(key => {
            if (key === 'Nr tygodnia') return;

            const rok = parseInt(key) === 2 ? 2020 : parseInt(key);
            const zgony = parseInt(row[key]);

            if (!isNaN(rok) && !isNaN(zgony)) {
                flattenedData.push({
                    rok: rok,
                    tydzien: tydzien,
                    zgony: zgony
                });
            }
        });
    });

    flattenedData.sort((a, b) => {
        if (a.rok !== b.rok) {
            return a.rok - b.rok;
        }
        return a.tydzien - b.tydzien;
    });

    return flattenedData;
}

module.exports = { cleanAndSortData };