class Compile {
    constructor(el, vm) {
        console.log(this)
        this.$vm = vm;
        this.$el = document.querySelector(el);

        if (this.$el) {
            this.compile(this.$el)
        }
    }
    compile(el) {
        const chilNodes = el.childNodes;
        Array.from(chilNodes).forEach(node => {

            if (this.isElement(node)) {
                //元素
                this.compileElement(node)
            } else if (this.isInterpolation(node)) {
                //文本         
                this.compileText(node)
            }

            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })

    }
    compileText(node) { //编译文本
        this.update(node,RegExp.$1,'text')
        //node.textContent = this.$vm[RegExp.$1]
    }
    compileElement(node) { //编译元素        
        let nodeAttrs = node.attributes;        
        Array.from(nodeAttrs).forEach(attr => {
            //判断是不是指令
            // k-xx="oo"
            const attrName = attr.name;
            const exp = attr.value;            
            if (this.isDirecitve(attrName)) {               
               let dir = attrName.substring(2)
               this[dir] && this[dir](node,exp)
            }
            if(this.isEvent(attrName)){
                //@click="onclick"
                let dir = attrName.substring(1)
                this.eventHandler(node,exp,dir)
            }
        })
    }
    isEvent(attrName){
      return attrName.indexOf("@") === 0
    }
    eventHandler(node,exp,dir){
        const fn = this.$vm.$options.methods[exp] && this.$vm.$options.methods[exp]
        node.addEventListener(dir,fn.bind(this.$vm))
    }
    update(node,exp,dir){
      // 初始化操作
      const fn = this[dir +'Updater']
      fn && fn(node,this.$vm[exp])
      //更新操作
      new Watcher(this.$vm,exp,function(val){
          fn && fn(node,val)
      })
    }
    // 实现指令 v-text="ss"
    
    // v-html ="ss"
    html(node,exp){
        this.update(node,exp,'html')
        //node.innerHTML =this.$vm[exp]
    }
    // model
    model(node,exp){        
        //update 赋值和更新
        this.update(node,exp,'model')
        //事件监听
        //更新值
        
        node.addEventListener('input',e=>{
            this.$vm[exp]=e.target.value
        })
    }
    modelUpdater(node,value){        
        // 绑定值
        node.value = value
        
    }
    textUpdater(node,value){
        node.textContent = value
    }
    htmlUpdater(node,value){
        node.innerHTML = value 
    }
    isElement(node) {
        return node.nodeType === 1
    }
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    isDirecitve(attrName){        
        return attrName.indexOf("k-") === 0
    }
    
}