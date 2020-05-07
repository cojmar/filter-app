class login_page{
    constructor(){
        
    }
    init_dom(){
        this.dom = {
            submit:$('#login_submit'),
            usr:$('#login_username'),
            password:$('#login_password'),
        };
        this.dom.submit.off('click').on('click',()=>{
            this.do_login();
        });
    }
    do_login(){
        app.ws_working(true);
        app.show_menu();
        app.ws_working(false);
    }
    init(){
        this.init_dom();        
    }
}