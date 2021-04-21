function observe(obj){
  if(typeof obj !=='object' || obj=== null){
      return;
  }
  new Observer(obj)  
}
function proxy(vm,sourceKey){
    Object.keys(vm[sourceKey]).forEach(key=>{
        Object.defineProperty(vm,key,{
            get(){                
                return vm[sourceKey][key]
            },
            set(newVal){
                vm[sourceKey][key]=newVal
            }
        })
    })
}
function defineReactive(obj,key,value){
  observe(value)
  const dep = new Dep()
  Object.defineProperty(obj,key,{
      get(){        
         Dep.target && dep.addDep(Dep.target)
          return value
      },
      set(newVal){
          if(newVal !== value){
             observe(newVal)             
             value = newVal 
             dep.notify()
             
          }       
      }
  })
}
class KVue {
    constructor(options){
      this.$options = options;
      this.$data = options.data;
      //响应化处理  
      observe(this.$data);
      //设置代理（app.counter=>app.$data.couner）
      proxy(this,'$data')
      // 编译
      new Compile(this.$options.el,this)
    }
}
//根据对象类型决定如何做响应化
class Observer {
   constructor(value){
       this.value = value
       //判断value的类型
       if(typeof this.value === 'object'){ //对象
          this.walk(value)
       }
   }
   walk(obj){
     Object.keys(obj).forEach(key=>{
         defineReactive(obj,key,obj[key])
     })
   }
}
//const watchers = [];
//watch 
class Watcher {
    constructor(vm,key,updateFn){
        this.vm =vm;
        this.key =key;
        this.updateFn = updateFn;
        Dep.target = this;
        this.vm[this.key];
        Dep.target = null       
    }
    update(){
        this.updateFn.call(this.vm,this.vm[this.key])
    }
}
// Dep
class Dep {
    constructor(){
        this.deps =[]
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach(dep=>dep.update())
    }
}