class vehicles_page{
    constructor(){
        
    }    
    
    init(){
        $.extend(true, $.fn.dataTable.defaults, {
            language: {
                decimal: ',',
                thousands: '.',
                emptyTable: 'No data available',
                info: '_START_ - _END_ from _TOTAL_',
                infoEmpty: '0 - 0 from 0',
                infoFiltered: '(filter from _MAX_ total)',
                infoPostFix: '',
                lengthMenu: '_MENU_ on page',
                loadingRecords: 'Loading…',
                processing: 'Processing…',
                search: 'Suche',
                searchPlaceholder: '',
                zeroRecords: 'No result',
                paginate: {
                    first: '<i class="fas fa-arrow-alt-circle-left"></i>',
                    last: '<i class="fas fa-arrow-alt-circle-right"></i>',
                    next: '<i class="fas fa-caret-circle-right"></i>',
                    previous: '<i class="fas fa-caret-circle-left"></i>'
                },
                select: {
                    rows: {
                        _: '(%d selected)',
                        0: '(0 selected)',
                        1: '(1 selected)'
                    }
                },
                buttons: {
                    colvis: 'Columns',
                    csv: '<i class="fas fa-file-csv"></i>&nbsp;Export CSV',
                    excel: '<i class="fas fa-file-excel"></i>&nbsp;Export XLSX',
                    pdf: '<i class="fas fa-file-pdf"></i>&nbsp;Export PDF',
                    print: '<i class="fas fa-print"></i>&nbsp;Print',
                    copy: '<i class="fas fa-copy"></i>&nbsp;Copy',
                    copyTitle: 'Copy',
                    copySuccess: {
                        _: '%d rows copy (Now you can use CTRL+V)',
                        1: '1 row copy (Now you can use CTRL+V)'
                    }
                },
                aria: {
                    sortAscending: ': sort ASC',
                    sortDescending: ': sort DESC'
                }
            }
        });

        $('#select2').select2({
            placeholder: 'Select an option',
            width: 'calc(100% - 60px)'
        });

        const tree_data = [{
            "id": 1,
            "text": "Region Wien",
            "checked": false,
            "hasChildren": true,
            "children": [{
                "id": 2,
                "text": "Area Wien",
                "checked": false,
                "hasChildren": true,
                "children": [{
                    "id": 3,
                    "text": "Garage Leopoldau",
                    "hasChildren": true,
                    "children": [{
                        "id": 8907,
                        "text": "W3565LO",
                        "checked": false,
                        "hasChildren": false,
                        "children": []
                    } , {
                        "id": 8909,
                        "text": "W3567LO",
                        "checked": false,
                        "hasChildren": false,
                        "children": []
                    }]
                } , {
                    "id": 3,
                    "text": "Garage Rax",
                    "hasChildren": true,
                    "children": [{
                        "id": 8907,
                        "text": "W2883LO",
                        "checked": false,
                        "hasChildren": false,
                        "children": []
                    } , {
                        "id": 8909,
                        "text": "W2870LO",
                        "checked": false,
                        "hasChildren": false,
                        "children": []
                    }]
                }]
            } , {
                "id": 2,
                "text": "Area Sweitzer",
                "checked": false,
                "hasChildren": true,
                "children": [{
                    "id": 3,
                    "text": "Garage Volksvagin",
                    "hasChildren": true,
                    "children": [{
                        "id": 8907,
                        "text": "W2883LO",
                        "checked": false,
                        "hasChildren": false,
                        "children": []
                    }]
                }]
            }]
        }];

        const tree = $('#tree').tree({
            primaryKey: 'id',
            uiLibrary: 'bootstrap4',
            dataSource: tree_data,
            checkboxes: true
        });

        $(".nav-tabs a").click(function(e){
            e.preventDefault();
            $(this).tab('show');
        });

        let example = $('#example').DataTable({
            paging: false,
            columnDefs: [{
                orderable: false,
                data: 0,
                className: 'select-checkbox',
                targets: 0
            }],
            columns: [
                { data: "sel", title: "" },
                { data: "code", title: "Code" },
                { data: "icon", title: "Icon" },
                { data: "size", title: "Size" },
                { data: "desc", title: "Description" }
            ],
            data: [{
                "sel": "",
                "code": "1234",
                "icon": "<i class=\"fas fa-bomb\"></i>",
                "size": 100,
                "desc": "Is a bomb"
            } , {
                "sel": "",
                "code": "4546",
                "icon": "<i class=\"fas fa-exclamation-triangle\"></i>",
                "size": 101,
                "desc": "Triangle ?"
            } , {
                "sel": "",
                "code": "3243",
                "icon": "<i class=\"fas fa-head-side-mask\"></i>",
                "size": 102,
                "desc": "Corona virus"
            }],
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [
                [1, 'asc']
            ]
        });

        var selected = ["4546", "3243"];

        example.column(1).data().each(function(value, index) {
            if (selected.includes(value)) {
                example.rows(index).select();
            }
            return true;
        });

        var codes_selected = example.rows({selected:true}).data().pluck('code').toArray();

        console.log(codes_selected);

        
        example.on("click", "th.select-checkbox", function() {
            if ($("th.select-checkbox").hasClass("selected")) {
                example.rows().deselect();
                $("th.select-checkbox").removeClass("selected");
            } else {
                example.rows().select();
                $("th.select-checkbox").addClass("selected");
            }
        }).on("select deselect", function() {
            ("Some selection or deselection going on")
            if (example.rows({
                    selected: true
                }).count() !== example.rows().count()) {
                $("th.select-checkbox").removeClass("selected");
            } else {
                $("th.select-checkbox").addClass("selected");
            }
        });

    }
}