define(function(require) {
    var monaco = require('vs/editor/editor.main');    
    class monaco_editor{
        constructor(){
            this.editors = {};
            window.onresize = ()=>{
                this.layout();
            }
        }
        init_editor(id,val = '',lang = 'javascript',theme = 'vs-dark'){
            let dom_obj = document.getElementById(id);
            if (!dom_obj) return false;
            this.editors[id] = monaco.editor.create(dom_obj, {
                value: val,
                theme: theme,
                language: lang,
                scrollBeyondLastColumn: true,
                scrollBeyondLastLine: true,

            });
            this.editors[id].do_action = (action)=> {
                var actions = this.editors[id].getActions();
                for (var editor_action_index in actions) {
                    var editor_action = actions[editor_action_index];
                    if (editor_action.label === action) {
                        editor_action.run();
                        break;
                    }
                }
                return this.editors[id];
            }
            this.editors[id].onDidChangeModelContent(()=>this.on_editor_change(id,this.editors[id].getValue()));
            return this.editors[id];
        }
        layout(){                        
            for (var id in this.editors) this.editors[id].layout();
        }
        on_editor_change(id,val){
            if (this.editors[id].change_timeout) clearTimeout(this.editors[id].change_timeout);
            this.editors[id].change_timeout = setTimeout(()=>this.on_change(id,val),500);
        }
        on_change(id,val){            
            if (typeof this.editors[id].on_change ==='function') this.editors[id].on_change(val);
        }
    }
    return new monaco_editor;
});