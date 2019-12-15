const kickstarterJson="https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const moviesalesJson = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const videogamesalesJson = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const queue = d3.queue();
  queue.defer(d3.json,kickstarterJson);
  queue.defer(d3.json,moviesalesJson);
  queue.defer(d3.json,videogamesalesJson);
  queue.awaitAll(main);

function main(error,Jsons){
    if (error) throw error;
  
  const padding = 50;
  const w = window.innerWidth-padding;
  const h = 0.8*window.innerHeight-padding;
  
  const colorScale = d3.scaleLinear().domain([0,32484119395]).range([0,255])
  function textSplit(input){
    return input.replace(" ","</tspan><tspan>");
  }
  
  const svg = d3.select("body").append("svg")
  .attr("width",w)
  .attr("height",h);
  
  function treemap(data){
   return d3.treemap()
    .size([w, h-100])
    .padding(1)
    //.round(true)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));}
  
  const root = treemap(Jsons[2]);
  
  const leaves = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
  const color = d3.scaleOrdinal()
    .domain(d=>d)
    .range(d3.schemeSet3);
  
  leaves.append("rect").attr("class","tile")
    .attr("data-name",(d)=>d["data"]["name"])
    .attr("data-category",(d)=>d["data"]["category"])
    .attr("data-value",(d)=>d["data"]["value"])
    .style("fill",(d)=>color(d["parent"]["data"]["name"]))
    .attr("width",(d)=>d.x1-d.x0)
    .attr("height",(d)=>d.y1-d.y0)
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut);
  
  function getPattern(JsonName){
    switch(JsonName){
      case "Kickstarter":
        return (/(\S{1,}\d*\s?\d*\S*)/g);
        break;
      case "Movies":
        return /(\S{1,}\d*\s?\d*\S+\d*\s\d*)/g;
        break;
      case "Video Game Sales Data Top 100":
        return /(\S{1,}\d*\s?\d*\S*)/g;
        break;
      default:
        //console.log("nothing");
        break;
    }
  }
  
  leaves.append("text")
    .selectAll("names")
    .data((d)=>(d["data"]["name"]).match(getPattern(d["parent"]["parent"]["data"]["name"])))
    .join("tspan")
    .attr("class","names")
    .style("fill","black").style("font-size",".6em")
    .text((d)=>(d))
    .attr("x",5)
    .attr("dy","1em")
  ;
  
  const legend = svg.append("g")
  .attr("id", "legend");
  
  legend.selectAll("rect")
    .data(root["data"]["children"])
    .join("rect")
    .attr("x",(d,i)=> w/2+(i%6*50)-120)
    .attr("y",(d,i)=> h-100+(Math.floor(i/6)*15)+8)
    .attr("width", "10px")
    .attr("height", "10px")
    .style("fill",(d)=>color(d["name"]))
    .attr("data-category", (d)=>d["name"])
    .attr("class", "legend-item")
    ;//.attr("fill",(d)=>"hsl("+(150)+",50%,"+eduColor(i*10)+"%)");
    
  legend.selectAll("text")
    .data(root["data"]["children"])
    .join("text")
    .text((d)=>d["name"])
    .attr("x",(d,i)=> w/2+(i%6*50)-100)
    .attr("y",(d,i)=> h-100+(Math.floor(i/6)*15)+16)
    .style("fill","black").style("font-size",".6em");
  
  d3.select("body")
    .append("div")
    .attr("id","tooltip")
    .style("visibility","hidden")
    .style("position","absolute")
    .style("border-radius","2px")
    .style("border","1px solid black")
    .style("padding","10px");
  
  function handleMouseOver(d,i){
    d3.select("#tooltip")
      .attr("data-value",d3.select(this).attr("data-value"))
      .style("visibility","visible")
      .style("background-color","white")
      .style("left",event.pageX+0+"px")
      .style("top",event.pageY-45+"px")
      .html(d3.select(this).attr("data-name")+"</br>"+d3.select(this).attr("data-category")+"</br>"+d3.select(this).attr("data-value")+" million");
  }
  function handleMouseOut(){
    d3.select("#tooltip").style("visibility","hidden");
  }
  
}