define(function(require){        
    class filter_app{
        constructor(){
            this.settings_key = 'filter_app';
            this.page_controllers = {};
            this.logged_in = this.check_login();            
            this.init_settings().init_dom().nav();
            this.working = 0;    
        }
        check_login(){
            return true;
        }
        nav(){
            this.ws_working(true);
            if (!this.page) this.page = 'vehicles';
            let url_data =window.location.href.split('#');
            this.base_url = window.location.origin + window.location.pathname;  
            if(this.base_url.indexOf('.') !==-1){
                this.base_url = this.base_url.split('/');
                this.base_url.pop();
                this.base_url = this.base_url.join('/')+'/';                
            }
            this.page = url_data[1] || this.page;            
            if (!this.logged_in) this.page = 'login';
            this.render();
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
        ws_call(data){            
            let call_url =  `${this.call_url}ws`;
            this.ws_working(true);
            fetch(call_url, {
                method: 'POST', // or 'PUT'
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',                                    
                },
                body: JSON.stringify(data),
            })
            .then((response) => {
                this.ws_working(false);
                return response.json();
            })
            .then((response_data) => {
                this.render(response_data.data);
                //console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            return this;
        }        
        get_view(view,done){
            this.ws_working(true);
            if (view){
                view = view.split('.').join('');
                view = this.base_url+'views/'+view+'.html';
            } 
            if (!this.views) this.views = {};
            if (typeof this.views[view] !=='undefined'){
                this.ws_working(false);
                done(this.views[view]);                
                return true;
            }
            fetch(view)               
            .then((response_data) => {
                if(response_data.ok){
                    return response_data.text();
                }else{                    
                    return false;
                }                    
            }).then((file_data)=>{
                this.views[view] = file_data;
                this.ws_working(false);
                done(this.views[view]);                
            });
        }
        render(){
            this.ws_working(true);
            if (typeof this.page_controllers[this.page] ==='undefined'){
                let controller_js = this.base_url+'app/'+this.page+'_page.js';                
                fetch(controller_js)               
                .then((response_data) => {
                    if(response_data.ok){
                        return response_data.text();
                    }else{
                        this.page_controllers[this.page] = false;
                        return false;
                    }                    
                }).then((file_data)=>{
                    if (file_data){
                        let script = document.createElement("script");
                        script.innerHTML = file_data;
                        //console.log(controller_js);
                        document.body.appendChild(script);   
                        try {
                            eval(`this.page_controllers[this.page] = new ${this.page}_page();`)
                        } catch (error) {
                            this.page_controllers[this.page] = false;
                        }                        
                    }       
                    this.ws_working(false);
                    this.render();
                });
                return true;
            }
            let controller = this.page_controllers[this.page];
            let view_html = this.page+'_page';
            this.get_view(view_html,(html)=>{
                if(html !== false){
                    document.getElementById('container').innerHTML = html;
                }else{
                    this.get_view('404_page',(html)=>{
                        document.getElementById('container').innerHTML = html;
                    });
                }
                if (typeof controller === 'object' && typeof controller.init ==='function'){
                    controller.init();
                }
            });
            this.ws_working(false);
        }        
    }
    let app = new filter_app;
    window.app = app;
    return app;
});