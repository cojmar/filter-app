class vehicles_page {
    constructor() {
        this.loaders = 0;
        this.filters = {
            level:'all',
            system:'all',
            type:'all'
        }
        this.selected_codes = [
            "1001"
        ];
        this.data_table = false;
        this.extend_data_table();
    }
    set_filter(filter,value){
        this.filters[filter] = value;        
        this.render_filters().filter_table();
    }
    filter_table(){
        if (!this.data_table) return this;
        window.app.ws_working(true);
        this.loaders++;
        setTimeout(() => {
            this.data_table.draw();    
        },100);
        return this;
    }
    extend_data_table(){
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

        $.fn.dataTable.render.ellipsis = function (cutoff, wordbreak, escapeHtml) {
            var esc = function (t) {
                return t
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            };

            // noinspection JSUnusedLocalSymbols
            return function (d, type, row) {
                // Order, search and type get the original data
                if (type !== 'display') {
                    return d;
                }

                if (typeof d !== 'number' && typeof d !== 'string') {
                    return d;
                }

                d = d.toString(); // cast numbers

                if (d.length <= cutoff) {
                    return d;
                }

                var shortened = d.substr(0, cutoff - 1);

                // Find the last white space character in the string
                if (wordbreak) {
                    shortened = shortened.replace(/\s([^\s]*)$/, '');
                }

                // Protect against uncontrolled HTML input
                if (escapeHtml) {
                    shortened = esc(shortened);
                }

                return '<span class="ellipsis" title="' + esc(d) + '" data-toggle="tooltip" data-trigger="hover" data-placement="top" data-boundary="viewport">' + shortened + '&#8230;</span>';
            };
        };

        $.fn.dataTable.ext.search.push(
            ( settings, data, dataIndex )=> {
                if (window.data_table_render_time_out) clearTimeout(window.data_table_render_time_out);
                window.data_table_render_time_out = setTimeout(() => {                    
                    this.done_render();
                }, 100);
                if (!this.data_table) return true;  
                if (Object.values(this.filters).every((val, i, arr) => val === arr[0])) return true;
                 

                let row_data = this.data_table.rows( dataIndex ).data().toArray()[0];
                
                for(let filter in this.filters){
                    if (this.filters[filter] !=='all' && row_data[filter] !==this.filters[filter]){
                        return false;
                    }
                }
                return true;                        
            }
        );
        return this;
    }
    init_select2(){
        $('#select2').select2({
            placeholder: 'Select an option',
            width: 'calc(100% - 60px)'
        });
        return this;
    }
    render_tree(){
        this.tree = $('#tree').tree({
            primaryKey: 'id',
            uiLibrary: 'bootstrap4',
            dataSource: 'assets/build/cars.json',
            checkboxes: true
        });
        return this;
    }
    init_filters(){
        $(".nav-tabs a").off('click').on('click',(e)=>{
            e.preventDefault();            
            this.set_filter('level',e.target.hash.substr(1));
        });
        $('.system_filter').off('click').on('click',(e)=>{            
            this.set_filter('system',$(e.target).data('value'));
        });

        $('.type_filter').off('click').on('click',(e)=>{            
            this.set_filter('type',$(e.target).data('value'));
        });

        return this;
    }
    render_filters(){
        $('.system_filter.btn-primary').removeClass('btn-primary').addClass('btn-secondary');
        $('.system_filter[data-value="'+this.filters.system+'"]').removeClass('btn-secondary').addClass('btn-primary');

        $('.type_filter.btn-primary').removeClass('btn-primary').addClass('btn-secondary');
        $('.type_filter[data-value="'+this.filters.type+'"]').removeClass('btn-secondary').addClass('btn-primary');

        $('.nav-tabs a[href="#'+this.filters.level+'"]').tab('show');
        return this;
    }

    render_table(){
        this.data_table = $('#data_table').DataTable({
            //paging: false,
            columnDefs: [{
                orderable: false,
                data: 0,
                className: 'select-checkbox',
                targets: 0
            },
            {
                targets: 2,
                width: "10px"
            },
            {
                targets: 1,
                data: 1,
                orderable: false,
                render: (data, type, row, meta) => {
                    let img = '';

                    if (data === null || data === false || $.trim(data) === '') {
                        img = 'default.png';
                    } else {
                        img = data;
                    }

                    return '<a href="javascript:" title="' + data + '"><img class="img-thumbnail" style="width:50px;background-color: ' + row['level'] + ';" alt="" loading="lazy" ondragstart="return false;" src="assets/code_img/' + img + '" /></a>';
                }
            }, {
                targets: 6,                
                render: (data, type, row, meta) =>{
                    return $.fn.dataTable.render.ellipsis(50, true)(data, type, row);
                }
            },{
                targets:5,
                orderable: false,
                render:(data, type, row, meta)=>{
                    return `
                        <input type="text" value="" disabled>
                    `;
                }
            }],
            columns: [
                { data: "sel", title: "" },
                { data: "icon", title: "Icon" },
                { data: "code", title: "Code" },
                { data: "type", title: "Type" },
                { data: "system", title: "System" },
                { data: "sel", title: "Nach" },
                { data: "desc", title: "Description" }
            ],

            ajax: 'assets/build/codes.json',            
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [
                [2, 'asc']
            ]
        });
        this.data_table.on("click", "th.select-checkbox",  ()=> {
            if ($("th.select-checkbox").hasClass("selected")) {
                this.data_table.rows().deselect();
                $("th.select-checkbox").removeClass("selected");
            } else {
                this.data_table.rows().select();
                $("th.select-checkbox").addClass("selected");
            }
        }).on("select deselect", ()=> {
            ("Some selection or deselection going on")
            if (this.data_table.rows({
                selected: true
            }).count() !== this.data_table.rows().count()) {
                $("th.select-checkbox").removeClass("selected");
            } else {
                $("th.select-checkbox").addClass("selected");
            }
        });
        return this;
    }

    init(){
        this.render_filters();
        window.app.ws_working(true);
        this.loaders++;
        setTimeout(() => {
            this.init_filters().init_select2().render_tree().render_table();    
        });
    }

    done_render(){
        for (let i=0;i<=this.loaders;i++){
            window.app.ws_working(false);
        }
        this.loaders--;
        return this;
        this.data_table.column(2).data().each((value, index)=>{
            if (this.selected_codes.includes(value)) {
                this.data_table.rows(index).select();                
            }
            else{
                //this.data_table.rows(index).deselect();
            }
            //console.log(value);
            return true;
        });
        var codes_selected = this.data_table.rows({ selected: true }).data().pluck('code').toArray();
        
        
    }
}