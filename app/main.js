//define(function(require){        
    class filter_app{
        constructor(){            
            this.settings_key = 'filter_app';
            this.modules = {};
            this.views = {};
            this.logged_in = true;                        
            this.working = 0;    
            this.local_data={};
            this.base_url = window.location.origin + window.location.pathname;  
            if(this.base_url.indexOf('.') !==-1){
                this.base_url = this.base_url.split('/');
                this.base_url.pop();
                this.base_url = this.base_url.join('/')+'/';                
            }
            $('body').hide();
            this.ajax_call('check_login','',(response_data)=>{
                if (typeof response_data.login !=='undefined'){
                    if (response_data.login) $('body').show();
                    this.get_module('main_page',(module)=>{
                        if (this.init_interval) clearInterval(this.init_interval);
                        this.init_interval = setInterval(() => {
                            if(module.check_data_loaded()){
                                clearInterval(this.init_interval);                        
                                this.init();
                            }                    
                        },100);
                    });
                }else{
                    this.need_login();
                }
            });
        }
        data(key,value){
            if (typeof key ==='undefined'){
                return this.local_data;
            }else if (typeof value ==='undefined'){
                return (typeof this.local_data[key] !=='undefined')?this.local_data[key]:null;
            }
            this.local_data[key] = value;
            return this.local_data[key];            
        }
        init(){
            this.get_module('main_page',(module)=>{                
                if(module.check_data_loaded()){   
                    this.data('codes',module.codes);                    
                    this.init_settings().init_dom().nav();
                }                    
                
            });
        }
        need_login(){
            $('body').hide();
            setTimeout(() => {
                alert('Login expired');    
            }, 100);    
        }
        ajax_call(url = false,data = false,cb=false,cb_catch=false,type="json"){
            if (!url) return this;
            this.ws_working(true);
            let opts = {cache: "no-store"};
            opts = (typeof data ==='object')?{cache: "no-store",method: 'post',body:JSON.stringify(data)}:opts;

            setTimeout(() => {
                fetch(url, opts)
                .then(response =>{
                    this.ws_working(false);
                    if (!response.ok){
                        throw Error(response.statusText);
                    }else{
                        return (typeof response[type] ==='function')?response[type]():response;
                    }             
                })
                .then(response_data =>{                
                    if (typeof cb === 'function') cb(response_data)
                }).catch(error=>{
                    if (typeof cb_catch === 'function') cb_catch(error);
                    else this.need_login();
                });
            }, 100);

            return this
        }
      
        nav(){
            this.ws_working(true);
            if (!this.page) this.page = 'main';
            let url_data =window.location.href.split('#');     
            this.page = url_data[1] || this.page;            
            if (!this.logged_in) this.page = 'login';
            this.show_menu().render();
            this.ws_working(false);
        }
        init_settings(){
            let storage_settings = localStorage.getItem(this.settings_key);
            this.settings = {
                
            };
            if (typeof storage_settings !=='undefined'){
                storage_settings = JSON.parse(storage_settings);
                for (let k in storage_settings){                    
                    if (typeof this.settings[k] !=='undefined') this.settings[k] = storage_settings[k];
                }
            }            
            return this;
        }
        set_setting(sk,sv){
            this.settings[sk] = sv;
            localStorage.setItem(this.settings_key, JSON.stringify(this.settings));
            return this;
        }       
        init_dom(){           
            window.addEventListener('hashchange',()=>{
                setTimeout(()=>{
                    this.nav();
                },200);                
            });
            return this;
        }    
        show_menu(){
            return this;
        }
        ws_working(is_working=false){
            if (is_working) this.working++;
            else this.working--;
            let show = true;
            if (this.working <= 0){
                this.working = 0;
                show = false;
            }
            if (show) $('#loader').show();
            else $('#loader').hide();
        }        
    
        get_view(view,cb){
            if (!view) return false;
            if (typeof cb !=='function') cb = (view)=>{}
            if (typeof this.views[view]!=='undefined'){
                return cb(this.views[view])
            }
            //console.log('loading view',view);
            this.views[view] = false;
            let url = this.base_url+'views/'+view.split('.').join('')+'.html';
            this.ajax_call(url,false,(response_data)=>{
                this.views[view] = response_data;
                cb(this.views[view]);                
            },(error)=>{
                cb(this.views[view])
            },'text');
        }

        get_module(module,cb){
            if (!module) return false;
            if (typeof cb !=='function') cb = (module)=>{}
            if (typeof this.modules[module]!=='undefined'){
                return cb(this.modules[module])
            }
            console.log('loading module',module);
            this.modules[module] = false;
            let url = this.base_url+'app/'+module.split('.').join('')+'.js';
            this.ajax_call(url,false,(response_data)=>{
                let script = document.createElement("script");
                script.innerHTML = response_data;
                document.body.appendChild(script);   
                try {
                    eval(`this.modules[module] = new ${module}();`)
                } catch (error) {
                    this.modules[module] = false;                    
                }
                cb(this.modules[module]);                
            },(error)=>{
                cb(this.modules[module])
            },'text');
        }
        render(){
            this.get_view(this.page+'_page',(html)=>{
                if(html !== false){
                    document.getElementById('container').innerHTML = html;
                }else{
                    this.get_view('404_page',(html)=>{
                        document.getElementById('container').innerHTML = html;
                    });
                }
                this.get_module(this.page+'_page',(module)=>{
                    if (typeof module.init ==='function') module.init();
                });             
            });
        }
    }
    let app = new filter_app;
    window.app = app;
    //return app;});