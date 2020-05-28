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
        this.init_done = false;
        this.codes =false;
        this.data_table = false;
        this.extend_data_table();
        this.get_codes();
    }
    get_codes(){        
        window.app.ws_working(true);
        fetch('assets/build/codes.json')
        .then(response => response.json())
        .then(response_data =>{
            this.codes = response_data.data;
            window.app.ws_working(false);
        });
        return this;
    }    

    show_modal(){
        $('#email_modal').modal('show');
    }
    get_default_code_value(code){
        return 2;
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

        $('#test_button').off('click').on('click',(e)=>{
            this.import_table();
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
        $('#table_container').html(`
            <table id="data_table" class="display" style="width: 100%;"></table>            
        `);

        this.data_table = $('#data_table').DataTable({
            //paging: false,
            columnDefs: [{
                orderable: false,
                data: 0,
                defaultContent: '',
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
                        <input type="text" value="" style="width:50px;" disabled>
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

            /*ajax: 'assets/build/codes.json',*/            
            data:this.codes,
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [
                [2, 'asc']
            ],
            drawCallback:()=>{
                this.done_render();
            }
        });
        this.data_table.on("click", "th.select-checkbox",  ()=> {
            if ($("th.select-checkbox").hasClass("selected")) {
                this.data_table.rows().deselect();
                $("th.select-checkbox").removeClass("selected");
            } else {
                this.data_table.rows().select();
                $("th.select-checkbox").addClass("selected");
            }
        }).on("select", (e, dt, type, indexes)=> {
            this.data_table.rows(indexes).nodes().to$().find('input[type="text"]').first().removeAttr('disabled');
        }).on("deselect", (e, dt, type, indexes)=> {
            this.data_table.rows(indexes).nodes().to$().find('input[type="text"]').first().val('').attr('disabled', '');
        });
        //this.add_data_to_table(this.codes);
        return this;
    }

    init(){        
        this.render_filters();
        if (!this.codes){
            if (this.reinit) clearTimeout(this.reinit);
            this.reinit = setTimeout(() => {
                this.init();   
            });
            return false;
        }
        console.log('init');
        window.app.ws_working(true);
        this.loaders++;
        setTimeout(() => {
            this.init_filters().init_select2().render_tree().render_table(); 
        });
        this.init_done = true;
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

    export_table(){        
        let codes_selected = this.data_table.rows({ selected: true }).data().pluck('code').toArray();
        let data = {};
        this.data_table.rows({ selected: true }).nodes().to$().find('input[type="text"]').each(function(i, el) {
            data[codes_selected[i]] = $(el).val();   
        });
        console.log(data);
    }

    clear_table(){
        let clear_rows = this.data_table.rows({ selected: true });
        clear_rows.nodes().to$().find('input[type="text"]').val('').attr('disabled', '');
        clear_rows.deselect();
    }

    import_table(){
        this.clear_table();
        let data = {"1001":"1","1002":"2"};
        console.log(data);

        this.data_table.column(2).data().each((value, index)=>{
            if (Object.keys(data).includes(value)) {
                let row = this.data_table.row(index);
                row.select();
                $(row.node()).find('input[type="text"]').first().val(data[value]);
            }
        });
    }

}