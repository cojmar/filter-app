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


        const tree_data = [{"id":1,"text":"Asia","population":null,"flagUrl":null,"checked":false,"hasChildren":false,"children":[{"id":2,"text":"China","population":1373541278,"flagUrl":"https://code.gijgo.com/flags/24/China.png","checked":false,"hasChildren":false,"children":[]},{"id":3,"text":"Japan","population":126730000,"flagUrl":"https://code.gijgo.com/flags/24/Japan.png","checked":false,"hasChildren":false,"children":[]},{"id":4,"text":"Mongolia","population":3081677,"flagUrl":"https://code.gijgo.com/flags/24/Mongolia.png","checked":false,"hasChildren":false,"children":[]}]},{"id":5,"text":"North America","population":null,"flagUrl":null,"checked":false,"hasChildren":false,"children":[{"id":6,"text":"USA","population":325145963,"flagUrl":"https://code.gijgo.com/flags/24/United%20States%20of%20America(USA).png","checked":false,"hasChildren":false,"children":[{"id":7,"text":"California","population":39144818,"flagUrl":null,"checked":false,"hasChildren":false,"children":[]},{"id":8,"text":"Florida","population":20271272,"flagUrl":null,"checked":false,"hasChildren":false,"children":[]}]},{"id":9,"text":"Canada","population":35151728,"flagUrl":"https://code.gijgo.com/flags/24/canada.png","checked":false,"hasChildren":false,"children":[]},{"id":10,"text":"Mexico","population":119530753,"flagUrl":"https://code.gijgo.com/flags/24/mexico.png","checked":false,"hasChildren":false,"children":[]}]},{"id":11,"text":"South America","population":null,"flagUrl":null,"checked":false,"hasChildren":false,"children":[{"id":12,"text":"Brazil","population":207350000,"flagUrl":"https://code.gijgo.com/flags/24/brazil.png","checked":false,"hasChildren":false,"children":[]},{"id":13,"text":"Argentina","population":43417000,"flagUrl":"https://code.gijgo.com/flags/24/argentina.png","checked":false,"hasChildren":false,"children":[]},{"id":14,"text":"Colombia","population":49819638,"flagUrl":"https://code.gijgo.com/flags/24/colombia.png","checked":false,"hasChildren":false,"children":[]}]},{"id":15,"text":"Europe","population":null,"flagUrl":null,"checked":false,"hasChildren":false,"children":[{"id":16,"text":"England","population":54786300,"flagUrl":"https://code.gijgo.com/flags/24/england.png","checked":false,"hasChildren":false,"children":[]},{"id":17,"text":"Germany","population":82175700,"flagUrl":"https://code.gijgo.com/flags/24/germany.png","checked":false,"hasChildren":false,"children":[]},{"id":18,"text":"Bulgaria","population":7101859,"flagUrl":"https://code.gijgo.com/flags/24/bulgaria.png","checked":false,"hasChildren":false,"children":[]},{"id":19,"text":"Poland","population":38454576,"flagUrl":"https://code.gijgo.com/flags/24/poland.png","checked":false,"hasChildren":false,"children":[]}]}];

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
                className: 'select-checkbox',
                targets: 0
            }],
            select: {
                style: 'os',
                selector: 'td:first-child'
            },
            order: [
                [1, 'asc']
            ]
        });
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