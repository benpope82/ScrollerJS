/*
 *  Copyright (c) 2014-2015, Pi Ke, All rights reserved
 *  
 *  This is a free software
 *
 *  Author      : Pi Ke
 *  Description : A number scroller module to be embeded in your web apps
 *  Website     : http://www.pixelstech.net
 */
;(function(parent){
	var Util = {
		extend:function(sup, sub){
			sub.prototype = Object.create(sup.prototype);
			sub.prototype.constructor = sup;
			return sub;
		},
		clone:function(obj) {
		    if (null == obj || "object" != typeof obj) return obj;
		    var copy = obj.constructor();
		    for (var attr in obj) {
		        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		    }
		    return copy;
		}
	};

	//Define ScrollPanel class
	function ScrollPanel(props){
		this.fragment=null;
		this.div=null;
		this.direction=props.direction||null;
		this.interval=props.interval||0;
		this.amount=props.amount||0;
		this.width=props.width||0;
		this.height=props.amount||0;
		this.textAlign=props.textAlign||"center";
		this.upperBound=props.upperBound||9;
		this.forceFallback=props.forceFallback || false;
		this.mode=props._mode||Scroller.MODE.COUNTUP;
		//Private variables
		this.scrolledAmount=0;
		this.stepSize=Math.ceil((this.amount+1)*1.0/10) || 2;
		this.stepInterval=0;
		this.step=1;
		this.startNum=1;
		this.endNum=1;
		this.nextNum=1;
		this.firstChild = null;
		this.lastChild  = null;
		this.count = 0;
	}
	ScrollPanel.prototype=(function(){
		return {
			init:function(){
				this.fragment=document.createDocumentFragment();
				this.div=document.createElement("div");
				this.div.className="scroller";
				this.div.setAttribute("style","position:relative;overflow:hidden;width:"+this.width+"px;text-align:"+this.textAlign+";height:"+(this.height)+"px;line-height:"+this.height+"px;");
				//Create the first child
				this.firstChild=document.createElement("span");
				this.firstChild.className="scroller-span";
				this.firstChild.setAttribute("style","position:absolute;height:"+this.height+"px;line-height:"+this.height+"px;left:0px;width:"+this.width+"px;");
				this.div.appendChild(this.firstChild);
				//Create the last child
				this.lastChild = document.createElement("span");
				this.lastChild.className = "scroller-span";
				this.lastChild.setAttribute("style", "position:absolute;height:"+this.height+"px;line-height:"+this.height+"px;left:0px;width:"+this.width+"px;");
				switch(this.direction){
				case Scroller.DIRECTION.UP   : this.div.appendChild(this.lastChild); break;
				case Scroller.DIRECTION.DOWN : this.div.insertBefore(this.lastChild, this.firstChild); break; 
				}
				
				this.fragment.appendChild(this.div);
				return this;
			},
			start:function(start, end){
				start = parseInt(start);
				end   = parseInt(end);
				this.startNum = start;
				this.endNum = end;
				this.nextNum = this.startNum;

				if(this._mode == Scroller.MODE.COUNTDOWN){
					if(start!=end){
						this.step = (this.endNum>this.startNum)?(this.startNum+(this.upperBound+1)-this.endNum):(this.startNum-this.endNum);
					}else{
						this.step = 1;
					}
				} else {
					if(start!=end){
						this.step = (this.endNum<this.startNum)?(this.endNum+(this.upperBound+1)-this.startNum):(this.endNum-this.startNum);
					}else{
						this.step = 1;
					}
				}

				this.firstChild.innerHTML = this.startNum;
				this.lastChild.innerHTML  = this.nextNum;
				
				this.innerStart();

				//Iterate the counter numbers
				this.iterate();
			},
			innerStart:function(){},
			iterate:function(){
				if(this.nextNum != this.endNum || this.lastChild.innerHTML != this.endNum){
					// Below check is to ensure the UI is updated properly.
					// Sometimes when in low memory situation the nextNum 
					// has been set to endNum, but the corresponding UI is 
					// not updated to the endNum
					if(this.nextNum == this.endNum){
						this.nextNum = parseInt(this.lastChild.innerHTML);
					}

					if(this.mode == Scroller.MODE.COUNTDOWN){
						this.nextNum = (this.nextNum == 0)?this.upperBound:(this.nextNum-1);
					} else {
						this.nextNum = (this.nextNum == this.upperBound)?0:(this.nextNum+1);
					}

					this.innerIterate();		
				}
			},
			innerIterate:function(){},
			scroll:function(firstChild, lastChild){},
			stop:function(){},
			revalidate:function(){
				this.nextNum = parseInt(this.nextNum);
				this.endNum  = parseInt(this.endNum);
				// If next number is the same as end number, do nothing
				if(this.nextNum == this.endNum){
					return;
				}

				if(this.mode == Scroller.MODE.COUNTDOWN){
					if(this.nextNum!=this.endNum){
						this.step = (this.endNum>this.nextNum)?(this.nextNum+(this.upperBound+1)-this.endNum):(this.nextNum-this.endNum);
					}else{
						this.step = 1;
					}
				} else {
					if(this.nextNum!=this.endNum){
						this.step=(this.endNum<this.nextNum)?(this.endNum+(this.upperBound+1)-this.nextNum):(this.endNum-this.nextNum);
					}else{
						this.step = 1;
					}
				}

				this.innerRevalidate();
			},
			innerRevalidate:function(){},
			resetPosition:function(){
				//Change position
				this.firstChild.style.top = "0px";

				switch(this.direction){
				case Scroller.DIRECTION.UP   :  this.lastChild.style.top  = this.height + "px";
												break;
				case Scroller.DIRECTION.DOWN :  this.lastChild.style.top  = (-this.height) + "px";
				                                break; 
				}
				this.firstChild.offsetHeight;
			},
			getPanel:function(){
				return this.fragment;
			},
			setEndNum:function(endNum){
				this.endNum=endNum;
			},
			setMode:function(mode){
				this.mode=mode;
			}
		};
	})();

	function CSSTransitionScrollPanel(props){
		ScrollPanel.call(this, props);
	}
	Util.extend(ScrollPanel, CSSTransitionScrollPanel);		

	CSSTransitionScrollPanel.prototype._set=function(obj, type, value){
		obj.style.setProperty("-webkit-"+type, value);
		obj.style.setProperty("-moz-"+type, value);
		obj.style.setProperty("-ms-"+type, value);
		obj.style.setProperty("-o-"+type, value);
		obj.style.setProperty(type, value);
	}

	// var _debugTransitionCount = 0, _startTime = 0, _endTime = 0;
	CSSTransitionScrollPanel.prototype._addEventListener=function(obj, that){
		var transitions = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'MSTransition'     : 'msTransitionEnd',
            'OTransition'      : 'oTransitionEnd',
            'transition'       : 'transitionend'
        };
        for(var t in transitions){
            if(obj.style[t] !== undefined){
                obj.addEventListener(transitions[t], function(event){
                	var transitionDuration = obj.style.transitionDuration || obj.style.webkitTransitionDuration;
					if(transitionDuration != "1ms"){
						that.stop();
					} else {
						setTimeout(function(){
							that.iterate();
						}, 1);
					}
				}, false);
				break;
            }
        }
	}

	CSSTransitionScrollPanel.prototype.innerStart = function(){
		this.stepInterval=Math.floor(this.interval*1.0/this.step);
		this.firstChild.style.top = "0px";

		switch(this.direction){
		case Scroller.DIRECTION.UP   :  this.lastChild.style.top  = this.height + "px";
										this.amount = -this.amount;
										break;
		case Scroller.DIRECTION.DOWN :  this.lastChild.style.top  = (-this.height) + "px";
		                                break; 
		}
		this._addEventListener(this.firstChild, this);
	};

	CSSTransitionScrollPanel.prototype.innerIterate = function(){
		//Swap first and last child
		this.firstChild.innerHTML = this.lastChild.innerHTML;
		this.lastChild.innerHTML  = this.nextNum;

		var durationProperty = (this.stepInterval)+"ms";
		this._set(this.firstChild, "transition-duration", durationProperty);
		this._set(this.lastChild,  "transition-duration", durationProperty);
		
		var that = this;
		setTimeout(function(){that.scroll(that.firstChild, that.lastChild);},0);						
	};

	CSSTransitionScrollPanel.prototype.scroll = function(firstChild, lastChild){
		var rand = 1.0 +(Math.random()/100000);  // This ensures "transitionend" event will always
												 // be fired when applied to transform.scaleY().
		var transformProperty = "translateY("+this.amount+"px) scaleX("+rand+")";
		this._set(firstChild ,"transform", transformProperty);
		this._set(lastChild  ,"transform", transformProperty);
	};

	CSSTransitionScrollPanel.prototype.stop = function(){
		var rand = 1.0 +(Math.random()/100000);
		var transformProperty = "translateY(0px) scaleX("+rand+")";
		var durationProperty  = "1ms";

		this.firstChild.innerHTML = this.lastChild.innerHTML;

		// Sometimes when in low memory situation the nextNum 
		// has been set to endNum, but the corresponding UI is 
		// not updated to the endNum
		this.nextNum = parseInt(this.lastChild.innerHTML); 

		this._set(this.firstChild,"transition-duration", durationProperty);
		this._set(this.lastChild ,"transition-duration", durationProperty);
		this._set(this.firstChild,"transform", transformProperty);
		this._set(this.lastChild ,"transform", transformProperty);
	};

	CSSTransitionScrollPanel.prototype.innerRevalidate = function(){
		this.stepInterval=Math.floor(this.interval*1.0/this.step);
	};

	function DOMScrollPanel(props){
		ScrollPanel.call(this, props);
	}
	Util.extend(ScrollPanel, DOMScrollPanel);

	DOMScrollPanel.prototype.innerStart = function(){
		this.stepInterval=Math.ceil((this.interval*this.stepSize)/(this.amount*this.step));
	};

	DOMScrollPanel.prototype.innerIterate = function(){
		this.resetPosition();
		//Swap first and last child
		this.firstChild.innerHTML = this.lastChild.innerHTML;
		this.lastChild.innerHTML  = this.nextNum;
		this.scroll(this.firstChild, this.lastChild);
	};

	DOMScrollPanel.prototype.scroll = function(firstChild, lastChild){
		var firstChildStyle = firstChild.style;
		var lastChildStyle  = lastChild.style;

		var top = parseInt(lastChildStyle.top);
		switch(this.direction){
		case Scroller.DIRECTION.UP     : 
		 							     if(top > 0){
		                                	firstChildStyle.top = (top - this.height - this.stepSize) + "px";
	                                		lastChildStyle.top  = (top - this.stepSize) + "px";
		                             	 }
										 break;
		case Scroller.DIRECTION.DOWN   : 
										 if(top < 0){
		                                	firstChildStyle.top = (top + this.height + this.stepSize) + "px";
		                                	lastChildStyle.top  = (top + this.stepSize) + "px";
		                             	 }
		                                 break;
		default:break;
		}

		this.scrolledAmount+=this.stepSize;
		if(this.scrolledAmount < this.amount){
			//Below is ensure that the last scroll will not overflow
			this.stepSize = Math.min(this.stepSize, (this.amount - this.scrolledAmount));
			var that = this;
			setTimeout(function(){that.scroll(firstChild, lastChild);},this.stepInterval);
		}else{
			this.stop();
			this.iterate();
		}
	};

	DOMScrollPanel.prototype.stop = function(){
		this.scrolledAmount = 0;
	};

	DOMScrollPanel.prototype.innerRevalidate = function(){
		this.stepInterval=Math.ceil((this.interval*this.stepSize)/(this.amount*this.step));
	};

	//ScrollPanelFactory
	var ScrollPanelFactory = (function(){
		var _isTransformSupported = _detectTransformSupport("transform");

		//Check whether CSS3 transform is supported
		function _detectTransformSupport(featureName){
		    var isSupported = false,
		    	domPrefixes = 'Webkit Moz ms O Khtml'.split(' '),
		    	elm = document.createElement('div'),
		    	featureNameCapital = null;

		    featureName = featureName.toLowerCase();

		    if(elm.style[featureName] !== undefined ) { isSupported = true; } 

		    if(isSupported === false){
		        featureNameCapital = featureName.charAt(0).toUpperCase() + featureName.substr(1);
		        for( var i = 0; i < domPrefixes.length; i++ ) {
		            if(elm.style[domPrefixes[i] + featureNameCapital ] !== undefined ) {
		              isSupported = true;
		              break;
		            }
		        }
		    }
		    return isSupported; 
		}

		return {
			createScrollPanel : function(props){
				if(_isTransformSupported && !props.forceFallback){
					return new CSSTransitionScrollPanel(props);
				}else{
					return new DOMScrollPanel(props);
				}
			}
		};
	})();

	var Scroller=(function(){
		var numOfComponent=0;
		
		function ScrollerImpl(props){
			this.scrollPanelArray=[];
			this.props=props;
			this.scrollPane=document.createElement("div");
			this.table=null;
			this.beginNum=0;
			this.endNum=0;
			this.css=null;
			this.width=this.props.width;
			this.init(0,0);
		}

		ScrollerImpl.prototype={
			init:function(begin,end){
				this.clear();
				this.oldCountArray=[];
				this.newCountArray=[];
				this.scrollPanelArray=[];
				this.beginNum=begin;
				this.endNum=end;
				begin=begin+"";
				end=end+"";
				var beginLength=begin.length,endLength=end.length;
				for(var i=0;i<beginLength;++i){
					this.oldCountArray.push(begin.charAt(i));
				}
				for(var i=0;i<endLength;++i){
					this.newCountArray.push(end.charAt(i));
				}

				//Do necessary padding
				var diff=Math.abs(beginLength-endLength);
				var maxLength=Math.max(beginLength,endLength);
				if(beginLength>endLength){
					for(var i=1;i<=diff;++i){
						this.newCountArray.unshift("0");
					}
				}else if(beginLength<endLength){
					for(var i=1;i<=diff;++i){
						this.oldCountArray.unshift("0");
					}
				}

				//Start building UI
				var divFragment=document.createDocumentFragment();
				this.table=document.createElement("table");
				this.table.className="scroller-table";
				this.table.setAttribute("style","margin:auto;");
				if(this.css!=null){
					this.setStyle(this.css);
				}
				
				var indWidth=Math.floor(this.width/maxLength);
				this.props._mode=(this.beginNum>this.endNum)?Scroller.MODE.COUNTDOWN:Scroller.MODE.COUNTUP;
				this.props.width = indWidth; //Set the width property

				this.innerInit(maxLength);

				divFragment.appendChild(this.table);
				this.scrollPane.appendChild(divFragment);

				for(var i=0,len=this.oldCountArray.length;i<len;++i){
					this.scrollPanelArray[i].start(this.oldCountArray[i],this.oldCountArray[i]);
				}
			},
			innerInit:function(maxLength){
				var seperatorCount=0;
				if(this.props.seperatorType!==Scroller.SEPERATOR.NONE){
					seperatorCount = this.props.seperatorType+1-maxLength%(this.props.seperatorType);
				}
				var tr=document.createElement("tr");
				for(var i=0;i<maxLength;++i){
					var td=document.createElement("td");
					
					//Update props
					var scrollPanel=ScrollPanelFactory.createScrollPanel(this.props).init();
					this.scrollPanelArray.push(scrollPanel);
					td.appendChild(scrollPanel.getPanel());
					tr.appendChild(td);

					if(this.props.seperatorType!=Scroller.SEPERATOR.NONE&&
					  (i+seperatorCount)%this.props.seperatorType===0&&(i+1)<maxLength){
						var td=document.createElement("td");
						var div = document.createElement("div");
						var span=document.createElement("span");
						span.className="scroller-span";
						span.innerHTML=this.props.seperator;
						div.setAttribute("style","height:"+(this.props.amount + 10)+"px;line-height:"+this.props.amount+"px;left:0px;top:0px;vertical-align:middle;");
						div.appendChild(span);
						td.appendChild(div);
						tr.appendChild(td);
					}
				}
				this.table.appendChild(tr);
			},
			appendTo:function(parent){
				parent.appendChild(this.scrollPane);
				return this;
			},
			getScrollPanels:function(){
				return this.scrollPanelArray;
			},
			//Here style should be JavaScript format
			setStyle:function(css){
				this.css=css;
				if(typeof css === "string"){
					var entries = css.split(";");
					for(var i in entries){
						var pair=entries[i].split(":");
						var key=pair[0];
						var value=(pair.length==2)?pair[1]:"";

						if(!this.isUnmodifiableStyle(key)){
							this.table.style[key]=value;
						}					
					}
				}else if(typeof css === "object"){
					for(var prop in css){
						this.table.style[prop]=css[prop];
					}
				}
				//Else silently ignore the css
			},
			isUnmodifiableStyle:function(propName){
				var unmodifiableAttributeNames=["position","overflow"];	
				for(var i in unmodifiableAttributeNames){
					if(propName.toLowerCase()===unmodifiableAttributeNames[i]){
						return true;
					}
				}
				return false;
			},
			start:function(number){
				var count=0;
				if(typeof number === "number"){
					count=parseInt(number)+"";
				}else{
					count=number.trim().replace(/,/g,"");
				}
				
				this.init(number,number);
			},
			scrollTo:function(number){
				var count=(number+"").trim().replace(/,:/g,"");
				if(count.length!=this.newCountArray.length){
					this.init(this.endNum, count);
				}else{
					this.beginNum=this.endNum;
					this.oldCountArray=this.newCountArray;
					this.endNum=count;
					this.newCountArray=[];
					this.props._mode=(this.beginNum>this.endNum)?Scroller.MODE.COUNTDOWN:Scroller.MODE.COUNTUP;
					for(var i=0,len=count.length;i<len;++i){
						this.newCountArray.push(count.charAt(i));
					}
				}

				this.refresh();
			},
			scrollFromTo:function(from,to){
				var from=(from+"").trim().replace(/,:/g,"");
				var to = (to+"").trim().replace(/,:/g,"");

				this.start(from);
				this.scrollTo(to);
			},
			refresh:function(){
				var that = this;
				setTimeout(function(){
					for(var i=0,len=that.oldCountArray.length;i<len;++i){
						if(that.props._mode){
							that.scrollPanelArray[i].setMode(that.props._mode);
						}
						that.scrollPanelArray[i].setEndNum(that.newCountArray[i]);
						that.scrollPanelArray[i].revalidate();
						that.scrollPanelArray[i].iterate();
					}
				},1);	
			},
			clear:function(){
				while (this.scrollPane.firstChild) {
    				this.scrollPane.removeChild(this.scrollPane.firstChild);
				}
			}
		};

		//Time ScrollerImpl
		function TimeScrollerImpl(props){
			ScrollerImpl.call(this, props);
		}
		Util.extend(ScrollerImpl, TimeScrollerImpl);
		TimeScrollerImpl.prototype.innerInit = function(maxLength){
			var seperatorCount = this.props.seperatorType+1-maxLength%(this.props.seperatorType);
			var tr=document.createElement("tr");
			for(var i=0;i<maxLength;++i){
				var td=document.createElement("td");

				var props = Util.clone(this.props);
				if(i%2==0){
					if(i==0){
						props.upperBound = 2;
					}else{
						props.upperBound = 5;
					}
				}
				//Update props
				var scrollPanel=ScrollPanelFactory.createScrollPanel(props).init();
				this.scrollPanelArray.push(scrollPanel);
				td.appendChild(scrollPanel.getPanel());
				tr.appendChild(td);

				if((i+seperatorCount)%props.seperatorType===0&&(i+1)<maxLength){
					var td=document.createElement("td");
					var div = document.createElement("div");
					var span=document.createElement("span");
					span.className="scroller-span";
					span.innerHTML=props.seperator;
					div.setAttribute("style","height:"+(props.amount + 10)+"px;line-height:"+props.amount+"px;left:0px;top:0px;vertical-align:middle;");
					div.appendChild(span);
					td.appendChild(div);
					tr.appendChild(td);
				}
			}
			this.table.appendChild(tr);
		};

		var ScrollerImplFactory = (function(){
			return {
				createScrollerImpl:function(props){
					var obj = null;
					switch(props.seperatorType){
					case Scroller.SEPERATOR.TIME :
						obj = new TimeScrollerImpl(props);
						break;
					case  Scroller.SEPERATOR.THOUSAND:
					default :
						obj = new ScrollerImpl(props);
						break;
					}
					return obj;
				}
			};
		})();

		return {
			DIRECTION:{
				UP    : 1,
				DOWN  : 2
			},
			SEPERATOR:{
				NONE     : 0,
				TIME     : 2,
				THOUSAND : 3
			},
			MODE:{
				COUNTUP   : 0,
				COUNTDOWN : 1
			},
			getNewInstance:function(props){
				numOfComponent++;

				//Sanitize properties
				props                   = props || {};
				props.direction         = props.direction || Scroller.DIRECTION.UP;
				props.interval          = props.interval || 5000;
				props.width             = props.width || 400;
				props.amount            = props.amount || 250;
				props.seperatorType     = props.seperatorType || Scroller.SEPERATOR.NONE;
				props.seperator         = props.seperator || "";
				props.textAlign         = props.textAlign || "center";
				props.forceFallback     = props.forceFallback || false;

				return ScrollerImplFactory.createScrollerImpl(props);
			},
			getScrollerSize:function(){
				return numOfComponent;
			}
		};
	})();

	//Export the components
	parent.Scroller=Scroller;
})(window); 