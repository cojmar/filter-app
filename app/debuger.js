define(function(require) {
    require('css!assets/css/debuger');    
    var $ = require('jquery');
    require('jquery-resizable');
    function debug(txt)
    {
        if(!txt) return false;
        //if (typeof debug_mode=='undefined') return false;
        //if (!debug_mode) return false;
        if (!document.getElementById("dump_log"))
        {
            $('head').append('<style type="text/css">#dump_log{position: fixed !important;bottom:0px;left:0px;right:0px;background-color:rgb(45, 45, 45);z-index:1001;}#dump_log_content{overflow-y:scroll;overflow-x:hidden;height:380px;width:100%;position:relative;border:1px solid #000000;margin-top:-20px;}.dump_log_head{background-color:rgb(19, 18, 18);height:22px;line-height:22px;text-align: center;color:#ffffFF;width:100%;overflow:hidden;}.dump_log_close{background-color:#000000;height:21px;line-height:19px;width:20px;float:left;text-align: center;cursor:pointer;border:1px solid #000000;}.dump_log_clear{margin-left:1px;background-color:#000000;height:21px;line-height:19px;width:40px;float:left;text-align: center;cursor:pointer;border:1px solid #000000;}.debug_hr{padding:0px;margin:0px;border: 0;border-top: 1px solid #5892a7;}</style>');
            
            
            $( "body" ).append('<div id="dump_log"><div class="dump_log_head">..:: debug ::.. <div class="dump_log_close dump_log_close_js">X</div><div class="dump_log_clear dump_log_clear_js">clear</div></div><br clear="all"/><div id="dump_log_content"></div></div>');
            $('.dump_log_close_js').bind('click',function() 
            {
                $('#dump_log').fadeOut(250);
            });
            $('.dump_log_clear_js').bind('click',function() 
            {
                $('#dump_log_content').html('');
            });
        }
        var date = new Date;
        var time =  date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+'  '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    
        if (typeof txt === 'object' || typeof txt === 'array') txt= "<xmp>"+JSON.stringify(txt, null, 2)+"</xmp>";
        $("#dump_log_content" ).append('<div><div class="dump_log_head"><div class="dump_log_close dump_log_close_js_row">X</div><div style="float:left">..::'+time+'::..</div></div><div>'+unescape(txt)+"</div></div>");
        $('#dump_log').show();
        $('#dump_log_content').scrollTop($('#dump_log_content')[0].scrollHeight);
        $('.dump_log_close_js_row').unbind().bind('click',function() 
        {
            $(this).parent().parent().html('');
        });
    }


    class my_app{
        constructor(){    
            this.output_data = {};
            this.input_data = {};
            this.monaco = require('./monaco');      
            this.data = {
                "host": "",
                "date": "",                
                "car_id": "",
                "parameters": []
            };
            if (localStorage){
                let storage_data = false;
                try {
                    storage_data = JSON.parse(localStorage.getItem('candy_data'));
                } catch (error) {
                    storage_data = false;
                }
                if (storage_data){                    
                    for (let k in storage_data){
                        //if (~Object.keys(this.data).indexOf(k)){
                            this.data[k] = storage_data[k];
                        //}
                    }
                }
            }
            this.posible_actions = {};
            let def_call = 
            {
                "action":"",
                "data":{
                    "host": "ro-galati.thoreb.com",
                    "date": "",                
                    "car_id": "",
                    "parameters": [
                        "Embark1",
                        "Disembark1",
                        "Embark2",
                        "Disembark2",
                        "Embark3",
                        "Disembark3",
                        "Disembark1",
                        "HighResolutionTotalVehicleDistance"
                    ]
                }
            };            
            def_call['data'] = this.data;
            def_call = JSON.stringify(def_call);            
            this.init_editors(def_call).init_resize().init_dom().ws_call(1);
            
        }
        set_data(data){            
            if (typeof data ==='object'){
                for (let k in data){
                    this.data[k] = data[k];
                }
            }
            if (localStorage){
                localStorage.setItem('candy_data',JSON.stringify(this.data));
            }            
        }
        set_action(action){
            if (typeof this.posible_actions !=='object') return false;
            if (typeof this.posible_actions[action] ==='undefined') return false;
            let action_data= {
                'action':action,
                data:this.posible_actions[action]
            };
            if (typeof action_data.data ==='object'){
                for (let data_k in action_data.data){
                    if (typeof this.data[data_k] !=='undefined'){
                       if(!action_data.data[data_k]) action_data.data[data_k] = this.data[data_k];
                    }
                }
            }
            let json_data = JSON.stringify(action_data);            
            this.input_data= action_data;            
            this.ws_call();
            this.input_editor.setValue(json_data);
        }
        init_editors(default_input=''){
            this.input_editor = this.monaco.init_editor('input_editor',default_input,'json');
            this.output_editor = this.monaco.init_editor('output_editor','','json');
            if (!this.input_editor) return this;
            if (!this.output_editor) return this;
            this.input_editor.on_change = (val)=>{
                let data = {};
                try {
                    eval("data ="+val);
                    //data = JSON.parse(val);
                } catch (error) {
                    data = {}
                }
                if (data.data) this.set_data(data.data);
                this.input_data = data;
                this.input_editor.do_action('Format Document');
            }                        
            this.monaco.layout();
            setTimeout(()=>{
                this.input_editor.do_action('Format Document');
            },100);            
            return this;
        }
        init_dom(){
            this.nav = document.getElementById('do_action');
            this.call_url = document.getElementById('call_url');
            let send_button = document.getElementById('send_button');
            let origin_url = (window.location.origin + window.location.pathname).split('client')[0];        
            if(window.absolute_path) origin_url = window.absolute_path;
            if (this.call_url) this.call_url.value = origin_url+'ws';            
            if (send_button) send_button.onclick = ()=>this.ws_call();            
            if (this.nav) this.nav.onchange = ()=>this.set_action(this.nav.value);
            this.render_nav();
            return this;       
        }
        init_resize(){
            if (typeof $ ==='undefined') return false;
            $(".panel-left").resizable({
                handleSelector: ".splitter",
                resizeHeight: false,
                onDrag:()=>{this.monaco.layout()},
                onDragEnd:()=>{this.monaco.layout()}
            });
            return this;
        }
        ws_call(no_render=0){
            this.output_data = {};            
            if (!this.call_url) return false;
            let call_url = (this.call_url)?this.call_url.value:'';
            fetch(call_url, {
                method: 'POST', // or 'PUT'
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',                                    
                },
                body: JSON.stringify(this.input_data),
            })
            .then((response) => response.json())
            .then((data) => {                
                this.output_data = data;
                 if (!no_render) this.render();
                 else this.render_nav();
                //console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            return this;
        }
        render_nav(){
            let out_data = this.output_data;
            if (out_data.execution_time) out_data = out_data.data;

            if (out_data && out_data.data && out_data.data.posible_actions){
                this.posible_actions = out_data.data.posible_actions;
            }                       
            let nav_options = "<option disabled selected>Action</option>";
            for (let action in this.posible_actions){
                nav_options +=`<option value="${action}">${action}</option>`;                
            }
            if (this.nav) this.nav.innerHTML = nav_options;
            
        }
        render(){
            this.render_nav();
            if (this.output_data.debug){
                if (!this.debug_output){
                    this.debug_output = document.getElementById('debug_div');
                }                
                //this.debug_output.innerHTML +=this.output_data.debug;
                debug(this.output_data.debug);
            }
            if (typeof this.output_data.debug !=='undefined') delete this.output_data.debug;
            let json_data = JSON.stringify(this.output_data);
            this.output_editor.setValue(json_data);
            this.output_editor.do_action('Format Document');        
        }
    }
    let app = new my_app;
    window.app = app;
    return app;
});