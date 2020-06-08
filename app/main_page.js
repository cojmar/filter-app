class main_page {
    constructor(){
        this.data_loaded={
            emails:false,
            codes:false,    
            cars:false,        
        }
        this.filters = {
            level:'all',
            system:'all',
            type:'all'
        }                
        this.codes =false;
        this.data_table = false;
        this.cars = false;
        this.email = null;
        this.emails = [];
        this.suggested_emails=[];
        this.email_data = {};        
        this.extend_data_table().get_cars().get_codes().get_emails();        
    }
    test_stuff(){     
        this.get_email_interval()
    }
    get_email_interval(){
        let attr = $('#inlineRadio1').attr('checked');        
        let interval = (attr ==='checked')?0:$('#email_interval').val();
        //if (!interval) interval = 0;
        console.log(attr);
        console.log(interval);
        return interval;
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
    import_tree(data=false){
        this.tree.uncheckAll();
        if (typeof data ==='object'){
            data.forEach(kid => {
                let node = this.tree.getNodeById(kid);
                this.tree.check(node);
            });
        }
    }
    export_tree(){      
        let result = this.tree.getCheckedNodes();           
        let find_all_kids = (item)=>{
            let ret = {};
            let node = this.tree.getNodeById(item);
            let children = this.tree.getChildren(node);
            children.forEach(kid => {
                ret[String(kid)] = 1;
            });
            return ret;
        }
        let omit = {};
        result.forEach(item => {
            let kids = find_all_kids(item);
            for (let n in kids) omit[n]=1;            
        });
        omit = Object.keys(omit);        
        let ret = [];
        result.forEach(item => {
            if (omit.indexOf(String(item)) ==-1){
                ret.push(item);
            }
        });
        return ret;
    }
    ajax_call(url = false,data = false,cb=false,cb_catch=false){
        window.app.ajax_call(url,data,cb,cb_catch);
        return this;
    }
    get_cars(){
        this.data_loaded['cars'] = false;
        this.ajax_call('assets/build/cars.json','',response_data =>{
            this.cars = response_data.data;
            this.data_loaded['cars'] = true;
        });
        return this;
    }
    get_emails(){
        this.data_loaded['emails'] = false;
        this.ajax_call('get_emails','',response_data =>{
            this.emails = response_data['emails'];
            this.suggested_emails = response_data['suggested_emails'];            
            this.data_loaded['emails'] = true;
        });
        return this;
    }
    get_codes(){        
        this.data_loaded['codes'] = false;
        this.ajax_call('assets/build/codes.json','',response_data =>{
            this.codes = response_data.data;
            this.data_loaded['codes'] = true;
        });
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
    load_email(){
        if (this.email ==='' || this.email === null){
            $('.only_when_email_selected').hide();
            return this;
        }
        $('.only_when_email_selected').show();
        let email_data = this.email_data[this.email] || false;
        let cb = (email_data2 = false)=>{
            if (!email_data2){
                email_data2 = {
                    codes:{},
                    vehicles:[],
                    email:{}
                }
            }
            this.email_data[this.email] = email_data2;
            window.app.ws_working(true);
            setTimeout(() => {            
                this.import_table(email_data2['codes']);
                this.import_tree(email_data2['vehicles']);
                this.import_email_settings(email_data2['email']);
            }, 100);      
        };



        if (!email_data){
            this.ajax_call('get_email/'+this.email,this.email,response_data =>{
                if(!response_data.error){
                    cb(response_data);
                }
            });
        }else{
            cb(email_data);
        }

     
        return this;
    }
    add_email(email){
        this.ajax_call('check_email/'+email,'',response_data =>{
            if(!response_data.status){
                this.ajax_call('save_email',{
                    email: {
                        email:email,
                        send_interval:0
                    }
                },response_data =>{
                    $('#email_modal').modal('hide');            
                    this.emails.push(email);
                    let newOption = new Option(email, email, false, false);
                    $('#emails').append(newOption).val(email).trigger('change');    
                });
            }else{
                let el = $('#add_email_btn');
                el.popover({
                    'content': 'email already exists',
                    'html': true,                
                    'placement': 'top'
                }).popover('show');
                setTimeout(() => {
                    el.popover('dispose');
                }, 500);
            }
        });
    }
    delete_email(e=false){
        let el =(e)?$(e.target):false;
        if (this.email === '') return this;
        if(confirm(`Are u sure u want to delete "${this.email}" `)){
            this.ajax_call('delete_email/'+this.email,'',response_data =>{
                let i = this.emails.indexOf(this.email);
                if (i!=-1) this.emails.splice(i,1);
                $('#emails').select2('destroy').html('');
                this.email = '';
                this.init_emails(); 
            });
        }
    }
    save_email(e=false){
        this.email_data[this.email]['codes'] = this.export_table();
        this.email_data[this.email]['vehicles'] = this.export_tree();
        let el =(e)?$(e.target):false;
        
        this.ajax_call('save_email',{
            email: {
                email:this.email,
                send_interval:0
            },
            codes: this.email_data[this.email]['codes'],
            vehicles: this.email_data[this.email]['vehicles']
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
        });

        return this;
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
    init_emails(){
        let emails = $('#emails');
        emails.off('change').on('change',()=>{
            this.email = emails.val();
            this.load_email();
        });
        emails.select2({
            placeholder: 'Select an email',
            width: 'calc(100% - 86px)',
            data:this.emails
        });
        emails.val(this.email).trigger('change');
        return this;        
    }
    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    init_add_email(){
        let add_email = $('#add_email');        
        add_email.select2();
        $('#new_email').off('click').on('click',(e)=>{            
            let suggested = this.suggested_emails.reduce((acc,email)=>{
                if (this.emails.indexOf(email)==-1) acc.push(email); 
                return acc;
            },[]);            
            add_email.select2('destroy').html('').select2({
                placeholder: 'Add an email',
                width: '100%',
                tags: true,
                dropdownParent:$('#email_modal'),            
                data:suggested
            });
            add_email.val(null).trigger('change');
            $('#email_modal').modal('show');
        });

        $('#add_email_btn').off('click').on('click',(e)=>{
            let el = $(e.target);
            let data = add_email.select2('data');
            let email_to_add = (data.length > 0)?data[0].id:'';
            let error = null;
            if (!this.validateEmail(email_to_add)) error = "invalid email";
            if(!error && this.emails.indexOf(email_to_add)!==-1) error = "email already exists";                        
            if(!error){            
                this.add_email(email_to_add);                
                return true;
            }
            el.popover({
                'content': error,
                'html': true,                
                'placement': 'top'
            }).popover('show');
            setTimeout(() => {
                el.popover('dispose');
            }, 500);
        });
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
    init_tree(){
        this.tree = $('#tree').tree({
            primaryKey: 'id',
            uiLibrary: 'bootstrap4',
            dataSource: 'assets/build/cars.json',
            checkboxes: true
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
            this.load_email();
        });

        $('#button_save').off('click').on('click',(e)=>{
            this.save_email(e);
        });
        $('#button_delete').off('click').on('click',(e)=>{
            this.delete_email(e);
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
                        <input type="text" value="" style="width:50px;" data-code="${row['code']}" disabled>
                    `;
                }
            }],
            columns: [
                { data: "sel", title: "" },
                { data: "icon", title: "Icon" },
                { data: "code", title: "Code"},
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
        this.data_table.on("click", "th.select-checkbox",  ()=> {
            if ($("th.select-checkbox").hasClass("selected")) {
                this.clear_table(true);                
            } else {
                this.data_table.rows().select();
                this.data_table.rows().nodes().to$().find('input[type="text"]').removeAttr('disabled');
                $("th.select-checkbox").addClass("selected");
                this.selection_default_code_value();
            }
        }).on("select", (e, dt, type, indexes)=> {            
            if (typeof indexes !=='undefined'){
                let def_val = (indexes.length ===1)?this.default_code_value(dt.data()['code']):'';
                let el = this.data_table.rows(indexes).nodes().to$().find('input[type="text"]').first();
                let el_cur_val = el.val();
                if (el_cur_val ==='') el.val(def_val);
                el.removeAttr('disabled');
                if (this.data_table.rows({
                    selected: true
                }).count() === this.data_table.rows().count()) {
                    $("th.select-checkbox").addClass("selected");
                }
            }            
        }).on("deselect", (e, dt, type, indexes)=> {            
            if ($("th.select-checkbox").hasClass("selected")) {         
                $("th.select-checkbox").removeClass("selected");
            }
            this.data_table.rows(indexes).nodes().to$().find('input[type="text"]').first().val('').attr('disabled', '');
        });        
        return this;
    }

    export_table(){        
        let data = {};        
        let nodes = $(this.data_table.rows({ selected: true }).nodes());
        nodes.find('input[type="text"]').each(function(i, el) {            
            data[$(el).data('code')] = $(el).val();   
        });
        return data;        
    }

    clear_table(clear_values = false){
        if ($("th.select-checkbox").hasClass("selected")) {         
            $("th.select-checkbox").removeClass("selected");
        }
        this.data_table.rows({ selected: true }).deselect();
        this.data_table.rows().nodes().to$().find('input[type="text"]').val('').attr('disabled', '');
        return this        
    }

    import_table(data){
        this.clear_table();
        let obj_keys = Object.keys(data);
        let select_rows = [];
        let index_map = this.data_table.rows()[0];
        this.data_table.column(2).data().each((value, index) => {
            if (obj_keys.includes(value)) {
                select_rows.push(index_map[index]);
                let row = this.data_table.row(index_map[index]);
                let node = row.node();
                console.log(node);
                $(row.node()).find('input[type="text"]').first().val(data[value]).removeAttr('disabled');
            }
        });
        this.data_table.rows(select_rows).select();
        if (this.data_table.rows({
            selected: true
        }).count() === this.data_table.rows().count()) {
            $("th.select-checkbox").addClass("selected");
        }
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
        //console.log(code);
        return 2;
    }

    init(){        
     
        this.render_filters();
        if (!this.check_data_loaded()){
            $('#vehicles_page').hide();
            for (let i=0;i<=2;i++) window.app.ws_working(true);
            this.re_init=setTimeout(() => {
                for (let i=0;i<=2;i++)  window.app.ws_working(false);                
                this.init();
            }, 1000);
            return false;
        }        
       
        $('#vehicles_page').hide();
        for (let i=0;i<=2;i++) window.app.ws_working(true);
        setTimeout(() => {
            this.init_buttons().init_emails().init_radio().init_add_email().init_tree().init_table();                
            $('#vehicles_page').show();
            for (let i=0;i<=2;i++)  window.app.ws_working(false);                
        }, 100);
    }   
}