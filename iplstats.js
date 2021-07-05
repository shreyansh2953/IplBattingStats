const request =require("request");
const cheerio =require("cheerio");
const path=require("path");
const fs =require("fs");

// url of the espninfo website from where i scrapped the data
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url,(err,res,html)=>{
    if(err)
    {
        console.log(err);
    }
    else
    {
        handleHtml(html);
    }
})

function handleHtml(html)
{
    let $=cheerio.load(html);
    let link =$(".widget-items a");
    let nextPageUrl = "https://www.espncricinfo.com"+link.attr("href");
    request(nextPageUrl,(err,res,html)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            handlematchresults(html);
        }
    })
}

function handlematchresults(html)
{
    fs.mkdir(path.join(__dirname,'ipl'),{recursive:true},(err)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("created succesfully");
        }
  
    })
    
    let $=cheerio.load(html);
   let arr= $(".league-scores-container .col-md-8.col-16");
   for(let i=0;i<arr.length;i++)
   {
       let links = $(arr[i]).find(".match-score-block .match-cta-container a");
    
           for(let j=0;j<links.length;j++)
           {
               if($(links[j]).attr("data-hover")=="Scorecard")
               {
                       let scorecardUrl = "https://www.espncricinfo.com"+$(links[j]).attr("href");
                    
                       request(scorecardUrl,(err,res,html)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            handleeachplayer(html);
                        }                  
                       })
                       
               }
           }
       
   }

}


function handleeachplayer(html)
{
    let $=cheerio.load(html);
    let arr =$(".match-info-MATCH .teams .team")
    let looseteam="";
    let winteam="";
  
//   find win team loose team;
    for(let i=0;i<arr.length;i++)
    {
        if( $(arr[i]).hasClass("team-gray"))
        {
              looseteam=$(arr[i]).find(".name-detail a p").text();
        }
        else
        {
            winteam=$(arr[i]).find(".name-detail a p").text();
        }

    }
    // when match draw
    if(looseteam=="")
    {
        
        let wintext= $(".match-info-MATCH .status-text span").text();
        let newstr=wintext.slice(12,wintext.length-12);
       let arr=newstr.split(" ");
       if(arr[0]=="KKR")
       {
             arr[0]="Kolkata";
       }
       if(arr[0]=="RCB")
       {
           arr[0]="Royal";
       }
        let teamarr= $(".match-info-MATCH .teams .team .name-detail a p");
     
        for(let i=0;i<teamarr.length;i++)
        {
            if($(teamarr[i]).text().includes(arr[0]))
            {
                winteam=$(teamarr[i]).text();
            }
            else{
                looseteam=$(teamarr[i]).text();
            }
        }     
        
    }
    fs.mkdir(path.join(__dirname,'ipl',looseteam),{recursive:true},(err)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("created succesfully");
        }
  
    })

    fs.mkdir(path.join(__dirname,'ipl',winteam),{recursive:true},(err)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("created succesfully");
        }
  
    })
    
      let collapsiblediv=$(".match-scorecard-page .match-scorecard-table .Collapsible");
    
        //    let title=$(collapsiblediv[1]).find(".col .header-title")
            //    console.log($(title).text())
      
     
      
      for(let i=0;i<collapsiblediv.length;i++)
      {
          
            
              let tablerow =$(collapsiblediv[i]).find(".table.batsman tbody tr");
            //   console.log(tablerow.length);
              for(let j=0;j<tablerow.length;j++)
              {
                    // let nameofplayer =$(tablerow[j]).find(".batsman-cell a")
                    let td = $(tablerow[j]).find("td");
                    //   console.log($(nameofplayer).text());
                    if(td.length == 8)
                    {
                        let name,runs,balls,four,six,srate,teamName;
                        name = $(tablerow[j]).find(".batsman-cell a").text();
                        runs =$(td[2]).text();
                        balls=$(td[3]).text();
                        four=$(td[5]).text();
                        six=$(td[6]).text();
                        srate=$(td[7]).text();
                         teamName=$(collapsiblediv[i]).find(".col .header-title").text();
                        
                         if(teamName.includes(looseteam))
                         {
                            data=`name : ${name}, runs: ${runs}, ballsFaced: ${balls}, fours: ${four}, six: ${six} , playingagainst: ${winteam} \n`;
                            fs.appendFile(path.join(__dirname,"ipl",looseteam,`${name}.txt`),data,(err)=>{
                                       if(err)
                                       {
                                           console.log(err);
                                       }
                            })
                         }
                         else
                         {
                            data=`name : ${name}, runs: ${runs}, ballsFaced: ${balls}, fours: ${four}, six: ${six} , playingagainst: ${looseteam} \n`;
                            fs.appendFile(path.join(__dirname,"ipl",winteam,`${name}.txt`),data,(err)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                     })

                         }
                          
      
                    }
                  
              }

          
        
        }
      
}