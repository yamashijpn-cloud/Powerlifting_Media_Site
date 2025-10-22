document.addEventListener('DOMContentLoaded', function() {
    const dataUrl = '/data/rankings.json';
    let allData = [];
    let grid;
    let dataView;

    // Column definitions (assuming these are similar to the original setup)
    const columns = [
        {id: "rank", name: "ランク", field: 1, sortable: true, width: 50},
        {id: "name", name: "名前", field: 2, sortable: true, width: 200},
        {id: "fed", name: "組織", field: 8, sortable: true, width: 60},
        {id: "date", name: "日付", field: 9, sortable: true, width: 80},
        {id: "location", name: "場所", field: 10, sortable: true, width: 80},
        {id: "sex", name: "性別", field: 13, sortable: true, width: 50},
        {id: "age", name: "年齢", field: 15, sortable: true, width: 50},
        {id: "equipment", name: "ギア", field: 14, sortable: true, width: 60},
        {id: "weightclass", name: "階級", field: 16, sortable: true, width: 60},
        {id: "bodyweight", name: "体重", field: 18, sortable: true, width: 60},
        {id: "squat", name: "スクワット", field: 19, sortable: true, width: 60},
        {id: "bench", name: "ベンチ", field: 20, sortable: true, width: 60},
        {id: "deadlift", name: "デッドリフト", field: 21, sortable: true, width: 60},
        {id: "total", name: "トータル", field: 22, sortable: true, width: 60},
        {id: "points", name: "GLP", field: 23, sortable: true, width: 60}
    ];

    // Options for the grid
    const options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        forceFitColumns: true,
        multiColumnSort: true
    };

    // Function to fetch data
    async function fetchData() {
        try {
            const response = await fetch(dataUrl);
            const data = await response.json();
            allData = data.rows.map((row, index) => {
                const obj = {};
                columns.forEach(col => {
                    obj[col.id] = row[col.field];
                });
                obj.id = index; // SlickGrid requires an 'id' field
                return obj;
            });
            initializeGrid();
            applyFiltersAndSort();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to initialize SlickGrid
    function initializeGrid() {
        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#theGrid", dataView, columns, options);

        // Wire up model events to drive the grid
        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();
        });

        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });

        // Set the initial data
        dataView.beginUpdate();
        dataView.setItems(allData);
        dataView.endUpdate();

        // Handle sorting
        grid.onSort.subscribe(function (e, args) {
            const comparer = (a, b) => {
                for (let i = 0; i < args.sortCols.length; i++) {
                    const x = a[args.sortCols[i].sortCol.field],
                          y = b[args.sortCols[i].sortCol.field];
                    const sign = args.sortCols[i].sortAsc ? 1 : -1;
                    if (x === y) continue;
                    return x > y ? sign : -sign;
                }
                return 0;
            };
            dataView.sort(comparer);
        });
    }

    // Function to apply filters and sort
    function applyFiltersAndSort() {
        dataView.setFilter(itemFilter);
        dataView.refresh();
    }

    // Filter function (to be implemented based on select elements)
    function itemFilter(item) {
        const fedFilter = document.getElementById('fedselect').value;
        const equipmentFilter = document.getElementById('equipmentselect').value;
        const weightclassFilter = document.getElementById('weightclassselect').value;
        const sexFilter = document.getElementById('sexselect').value;
        const ageFilter = document.getElementById('ageselect').value;
        const yearFilter = document.getElementById('yearselect').value;
        const eventFilter = document.getElementById('eventselect').value;
        const searchTerm = document.getElementById('searchfield').value.toLowerCase();

        // Federation filter
        if (fedFilter !== 'all-ipf-affiliates' && fedFilter !== 'all' && item.fed.toLowerCase() !== fedFilter.toLowerCase()) {
            return false;
        }

        // Equipment filter
        if (equipmentFilter !== 'all' && item.equipment.toLowerCase() !== equipmentFilter.toLowerCase()) {
            return false;
        }

        // Weightclass filter
        if (weightclassFilter !== 'all' && item.weightclass.toLowerCase() !== weightclassFilter.toLowerCase()) {
            return false;
        }

        // Sex filter
        if (sexFilter !== 'all' && item.sex.toLowerCase() !== sexFilter.toLowerCase()) {
            return false;
        }

        // Age filter
        // This will require more complex logic to match age ranges, for now a simple check
        if (ageFilter !== 'all' && !item.age.toLowerCase().includes(ageFilter.toLowerCase())) {
             // This is a simplified check. Real age filtering would need to parse age ranges.
            return false;
        }

        // Year filter
        if (yearFilter !== 'all' && !item.date.includes(yearFilter)) {
            return false;
        }

        // Event filter
        if (eventFilter !== 'all' && item.event.toLowerCase() !== eventFilter.toLowerCase()) {
            return false;
        }

        // Search term filter (checks across multiple fields)
        if (searchTerm) {
            const searchableFields = [
                item.name, item.fed, item.location, item.sex, item.age,
                item.equipment, item.weightclass, item.squat, item.bench,
                item.deadlift, item.total, item.points
            ];
            const match = searchableFields.some(field =>
                String(field).toLowerCase().includes(searchTerm)
            );
            if (!match) {
                return false;
            }
        }

        return true;
    }

    // Event listeners for filter changes
    document.getElementById('fedselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('equipmentselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('weightclassselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sexselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('ageselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('yearselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('eventselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sortselect').addEventListener('change', applyFiltersAndSort);
    document.getElementById('searchbutton').addEventListener('click', applyFiltersAndSort);
    document.getElementById('searchfield').addEventListener('keyup', applyFiltersAndSort);


    // Initial data fetch
    fetchData();
});
