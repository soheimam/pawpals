
const {Engine, Render,Bodies,World, MouseConstraint, Composites}= Matter

const w = window.innerWidth
const h = window.innerHeight

const sectionTag = document.querySelector("section.dogs")
const engine = Engine.create()
const renderer = Render.create({
  element: sectionTag,
  engine:engine,
  options:{
    height:h,
    width:w,
    background:"#f9f7f7",
    wireframes:false,
    pixelRatio: window.devicePixelRatio
  }
})


//create shape

const createShape = function (x,y, image){
  return Bodies.circle(x,y,25,{
    render: {
      sprite:{
      texture:
        image,
        xScale: 0.5,
        yScale: 0.5
    }
    }
  })
}

//   
//large rect
const bigRect = Bodies.rectangle(w/2,150, 254, 40,{
  	isStatic:true,
    render: {
      sprite:{
      texture:"/images/pawpalslogo.png",
        xScale: 0.5,
        yScale: 0.5
    }
    }
  })


const wallOptions = {
  isStatic:true,
  render:{
    visible:false
  }
}

const ground= Bodies.rectangle(w/2, h+50, w +100,100, wallOptions)
const ceiling = Bodies.rectangle(-50, h/2, 100, h+100, wallOptions)
const leftWall = Bodies.rectangle(-50, h/2, 100, h+100, wallOptions)
const rightWall = Bodies.rectangle(w+50, h/2, 100, h+100, wallOptions)

const mouseControl = MouseConstraint.create(engine, {
  element: sectionTag,
  constraint:{
    render:{
      visible:false
    }
  }
})

const initialShapes = Composites.stack(50,50,15,5,40,40, function(x,y){
  return createShape(x,y, "/images/dog-face.png")
})

World.add(engine.world,[
  bigRect,
  ground,
  ceiling,
  leftWall,
  rightWall,
  mouseControl,
  initialShapes
])

document.addEventListener("click", function(event){
  // get a dog
  const dogFaces = ["/images/dog-face.png","/images/dog-face1.png", "/images/dog-face2.png"]
  const random = Math.floor(Math.random() * dogFaces.length);

  // pass into func
  const shape = createShape(event.pageX,event.pageY, dogFaces[random])
  World.add(engine.world,shape)
})


//run both engine and renderer
Matter.Engine.run(engine)
Matter.Render.run(renderer)