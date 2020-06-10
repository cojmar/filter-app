class settings_page {
    constructor(){
        this.data_loaded={
          
        }
        this.filters = {
            level:'all',
            system:'all',
            type:'all'
        }                
        this.codes =window.app.data('codes');
        this.data_table = false;
        this.cars = false;
        this.email = null;
        this.emails = [];
        this.suggested_emails=[];
        this.email_data = {};        
        this.extend_data_table();        
    }
    test_stuff(){     
        console.log(this.get_email_interval())
    }
    get_email_interval(){
        let el = $('#email_interval');
        let val = parseFloat(el.val()) || 0;
        val = (el.attr('disabled'))?0:val;
        return val;
    }
    import_email_settings(data){
        if (typeof data['send_interval'] ==='undefined'){
            data['send_interval'] = 0;
        }        
        this.render_email_settings(data);
    }
    render_email_settings(data){
        $('#inlineRadio1').removeAttr('checked');
        $('#inlineRadio2').removeAttr('checked');
        $('#email_interval').val('');
        $('#email_interval').attr('disabled','disabled');
        
        if (parseFloat(data['send_interval']) === 0){
            $('#inlineRadio1').attr('checked', 'checked');
        }else{
            $('#inlineRadio2').attr('checked', 'checked');
            $('#email_interval').val(data['send_interval']);
            $('#email_interval').removeAttr('disabled');
        }
    }    
    ajax_call(url = false,data = false,cb=false,cb_catch=false){
        window.app.ajax_call(url,data,cb,cb_catch);
        return this;
    }   
    check_data_loaded(){
        for (let data_type in this.data_loaded){
            if (!this.data_loaded[data_type]){                
                return false;
            }
        }
        return true;
    }   
    set_filter(filter,value){
        this.filters[filter] = value;        
        this.render_filters().filter_table();
    }
    filter_table(){
        if (!this.data_table) return this;              
        window.app.ws_working(true);    
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
                    next: '<i class="fas fa-chevron-circle-right"></i>',
                    previous: '<i class="fas fa-chevron-circle-left"></i>'
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
    init_radio(){
        $('#inlineRadio1').off('click').on('click',(e)=>{
            $('#email_interval').attr('disabled','disabled');            
        });
        $('#inlineRadio2').off('click').on('click',(e)=>{
            $('#email_interval').removeAttr('disabled');
        });        
        return this;
    }    
    init_buttons(){
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

        $('#button_restore').off('click').on('click',(e)=>{
            this.import_settings();
        });

        $('#button_save').off('click').on('click',(e)=>{
            this.save_settings(e);
        });
        $('#button_delete').off('click').on('click',(e)=>{
            this.clear_table().render_email_settings({send_interval:0})
        });
        $('#button_test').off('click').on('click',(e)=>{
            this.test_stuff();
        });
        
        

       
        $('[data-toggle="popover"]').on('click',(e)=>{
            let el = $(e.target);
            el.popover({
                'content': el.data('popover'),
                'html': true,                
                'placement': 'top'
            }).popover('show');
            setTimeout(() => {
                el.popover('hide');
            }, 500);
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
    init_table(){
        $('#table_container').html(`
            <table id="data_table" class="display" style="width: 100%;"></table>            
        `);

        this.data_table = $('#data_table').DataTable({
            //paging: false,
            columnDefs: [
            {
                targets: 1,
                width: "10px"
            },
            {
                targets: 0,
                data: 1,
                orderable: false,
                render: (data, type, row, meta) => {
                    let img = '';

                    if (data === null || data === false || $.trim(data) === '') {
                        img = 'default.png';
                    } else {
                        img = data;
                    }

                    return '<a href="javascript:" title="' + data + '"><img class="img-thumbnail" style="width:30px;background-color: ' + row['level'] + ';" alt="" loading="lazy" ondragstart="return false;" src="assets/code_img/' + img + '" /></a>';
                }
            }, {
                targets: 5,                
                render: (data, type, row, meta) =>{
                    return $.fn.dataTable.render.ellipsis(50, true)(data, type, row);
                }
            },{
                targets:4,
                orderable: false,
                render:(data, type, row, meta)=>{                    
                    return `
                        <input type="text" value="" style="width:50px;" data-code="${row['code']}">
                    `;
                }
            }],
            columns: [
                
                { data: "icon", title: "Icon" },
                { data: "code", title: "Code"},
                { data: "type", title: "Type" },
                { data: "system", title: "System" },
                { data: "sel", title: "Nach" },
                { data: "desc", title: "Description" }
            ],                
            data:this.codes,            
            order: [
                [2, 'asc']
            ],
            drawCallback:()=>{                
                setTimeout(() => {
                    window.app.ws_working(false);    
                    window.app.ws_working(false);
                },100);                
                
            },
            preDrawCallback:()=>{                
                setTimeout(() => {
                    window.app.ws_working(true);    
                });                
                
            }
        });
        
        return this;
    }
    export_table(){        
        let data = {};        
        let nodes = $(this.data_table.rows().nodes());
        nodes.find('input[type="text"]').each(function(i, el) {            
            data[$(el).data('code')] = $(el).val();   
        });
        return data;        
    }
    clear_table(){ 
        this.data_table.rows().nodes().to$().find('input[type="text"]').val('');
        return this        
    }
    import_table(data){        
        this.clear_table();
        let obj_keys = Object.keys(data);
        let select_rows = [];
        let index_map = this.data_table.rows()[0];
        this.data_table.column(1).data().each((value, index) => {
            if (obj_keys.includes(value)) {
                select_rows.push(index_map[index]);
                let row = this.data_table.row(index_map[index]);                
                $(row.node()).find('input[type="text"]').first().val(data[value]);
            }
        });
        //console.log(select_rows);
        window.app.ws_working(false);
    }
    selection_default_code_value(){        
        this.data_table.rows({
            selected: true
        }).data().each((value, index)=>{
            let row = this.data_table.row(index);        
            let el = $(row.node()).find('input[type="text"]').first();
            if (el.val() ===''){
                let def_val = this.default_code_value(row.data()['code']);
                el.val(def_val);
            }
        });
    }
    default_code_value(code){
        return (this.settings['code'])?this.settings['code']:'';        
    }
    save_settings(e=false){
        let el =(e)?$(e.target):false;
        let settings = {
            codes:this.export_table(),
            send_interval:this.get_email_interval()
        };        
        this.ajax_call('save_settings',{
            settings: settings,           
        },response_data =>{
            if (el){
                el.popover({
                    'content': response_data.status,
                    'html': true,                
                    'placement': 'top'
                }).popover('show');
                setTimeout(() => {
                    el.popover('dispose');
                }, 600);
            }
            console.log(response_data);
        },(error)=>{
            console.log(error);
        });

        return this;
    }
    load_settings(cb=false){
        this.settings = {}
        this.ajax_call('assets/build/settings.json','',response_data =>{
            this.settings = response_data;            
            if (typeof cb ==='function') cb(this.settings);
        },(err)=>{
            this.settings = {
                'codes':{},
                'send_interval':0
            }
            if (typeof cb ==='function') cb(this.settings);
        });
    }
    import_settings(){
        if (this.settings){
            window.app.ws_working(true); 
            setTimeout(() => {
                if (this.settings.codes) this.import_table(this.settings.codes);
                this.import_email_settings(this.settings);    
                window.app.ws_working(false); 
            }, 100);
            
        }
        return this
    }
    init(){
        this.render_filters();
        $('.content-page').hide();
        for (let i=0;i<=2;i++)  window.app.ws_working(true);
        this.load_settings((settings)=>{
            $('.content-page').show().css('opacity',1);
            this.init_buttons().init_radio().init_table();
            this.import_settings();
            for (let i=0;i<=2;i++)  window.app.ws_working(false);            
        });       
    }   
}