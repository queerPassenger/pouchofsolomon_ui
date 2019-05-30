import React from 'react';
import {apiCall} from '../../utilities/apiCall';
import {schemaGenerator} from '../../utilities/schema';
import moment from 'moment'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isMobile } from '../../utilities/responsive';

export default class Record extends React.Component{
    constructor(props){
        super(props);
        this.state={
            entryList:props.toEditSet.length===0?[schemaGenerator('uiSchema','transaction')]:props.toEditSet,
            transactionClassificationSet:props.transactionClassificationSet,
            transactionTypeSet:props.transactionTypeSet,
            amountTypeSet:props.amountTypeSet,
        };  
        this.addDelpadTop='0px';
        this.handleRefresh=this.handleRefresh.bind(this);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if( JSON.stringify(prevState.transactionClassificationSet)!==JSON.stringify(nextProps.transactionClassification) || 
            JSON.stringify(prevState.transactionTypeSet)!==JSON.stringify(nextProps.transactionTypeSet) ||
            JSON.stringify(prevState.amountTypeSet)!==JSON.stringify(nextProps.amountTypeSet)
        ){
            return{
                transactionClassificationSet:nextProps.transactionClassificationSet,
                transactionTypeSet:nextProps.transactionTypeSet,
                amountTypeSet:nextProps.amountTypeSet,
            }
        }      
        // Return null to indicate no change to state.
        return null;      
    }
    componentDidMount(){
        this.addDelpadTop=document.getElementsByClassName(isMobile()?'m-record':'record')[0].clientHeight/2+'px';
        this.setState({
            entryList:this.state.entryList
        })
    }
    componentDidUpdate(){
        let {entryList}=this.state;
        let flag=false;
        entryList.map((entry)=>{
            if(!(entry.hasOwnProperty('transactionClassification'))){
                if(entry.transactionTypeId!==''){
                    if(this.state.transactionTypeSet.length>0){
                        this.state.transactionTypeSet.map((transaction)=>{
                            if(entry.transactionTypeId===transaction.transactionTypeId){
                                entry.transactionClassification=transaction.transactionClassification;
                                flag=true;
                            }
                        })
                    }
                }
            }
            if(entry.timeStamp===''){
                entry.timeStamp=new Date();     
                flag=true;
            }
            if(entry.amountTypeId===''){
                entry.amountTypeId=49;     
                flag=true;
            }
        });
        if(flag){
            this.addDelpadTop=document.getElementsByClassName(isMobile()?'m-record':'record')[0].clientHeight/2+'px';
            this.setState({
                entryList
            })
        }
       
    }
    handleChange(key,ind,e){
        if(key!=='amount' && key!=='comment' && key!=='transactionType'){
            if(e.target.value===''){
                return;
            }
        }
        let entryList=this.state.entryList;
        if(key==='transactionType'){
            if(entryList[ind]['transactionClassification']===''){
                alert('Please select transaction classification');
                return;
            }
        }

        
        entryList[ind][key]=e.target.value;
        if(key==='transactionClassification'){
            entryList[ind]['transactionTypeId']='';
            entryList[ind]['transactionType']='';
        }
        this.setState({
            entryList
        });
    }
    handleComboChange(val,ind){
        let entryList=this.state.entryList;
        entryList[ind]['transactionType']=val['transactionTypeName'];
        entryList[ind]['transactionTypeId']=val['transactionTypeId'];
        this.setState({
            entryList
        });
    }
    checkForNewEntry(ind){
        let entryList=this.state.entryList;
        if(entryList[ind]['transactionType']!==''){
            let filteredTransactionTypeSet=this.state.transactionTypeSet.filter(x=>{if(x.transactionClassification===entryList[ind]['transactionClassification']){return x}});
            let flag=true;
            filteredTransactionTypeSet.map((val)=>{
                if(val.transactionTypeName===entryList[ind]['transactionType']){
                    flag=false;
                }
                
            });
            if(flag){
                this.props.handleLoading(true);
                let payload={
                    transactionTypeName:entryList[ind]['transactionType'],
                    transactionClassification:entryList[ind]['transactionClassification']
                }
                let data={
                    apiPath:'/recordTransactionType',
                    type:'POST',
                    query:null,
                    payload:payload
                }
                apiCall(data)
                .then(res=>{
                    this.props.handleLoading(false);
                    if(res.status){
                        entryList[ind]['transactionTypeId']=res.data['transactionTypeId'];
                        this.setState({
                            entryList
                        },()=>{
                            this.props.getTransactionTypeList();
                        })
                    }
                    else{
                        alert('Failed to create transaction Type');
                        entryList[ind]['transactionTypeId']='';
                        entryList[ind]['transactionType']='';
                    }
                })
                .catch(err=>{
                    this.props.handleLoading(false);
                    console.log('err',err)
                });
            }
        }
    }
    deleteTransactionType(transactionTypeId){
        let data={
            apiPath:'/deleteTransactionType',
            type:'DELETE',
            query:null,
            payload:{transactionTypeId},
        }
        this.props.handleLoading(true);
        apiCall(data)
        .then(res=>{
            this.props.handleLoading(false);
            if(res.status){
                alert('Deleted Successfully');
                this.props.getTransactionTypeList();
            }
        })
        .catch(err=>{
            this.props.handleLoading(false);
            console.log('err',err)}
        );
    }
    handleDateChange(ind,date){
        let entryList = this.state.entryList;        
        entryList[ind]['timeStamp']=date;
        this.setState({
            entryList:entryList,
        });
    }
    handleSubmit(type){
        let entryList=JSON.parse(JSON.stringify(this.state.entryList));
        let convertedSchema=[];
        let errFlag=false;
        for(let i=0;i<entryList.length;i++){            
            if(!(entryList[i]['transactionTypeId'] && entryList[i]['timeStamp'] && entryList[i]['comment'] && entryList[i]['amount'] && entryList[i]['amountTypeId'])){
                alert('Fields cant be empty');
                errFlag=true;
                break;
            }
            let convertedSchemaObj=schemaGenerator('apiSchema','transaction');
            if(type==='submit')
                convertedSchemaObj['createdTimeStamp']=new Date();
            else {   
                convertedSchemaObj['lastUpdatedTimeStamp']=new Date();
                convertedSchemaObj['transactionId']=entryList[i]['transactionId'];
            }
            convertedSchemaObj['transactionTypeId']=Number(entryList[i]['transactionTypeId']);
            convertedSchemaObj['transactionType']= entryList[i]['transactionId'];
            convertedSchemaObj['timeStamp']=entryList[i]['timeStamp'];
            convertedSchemaObj['comment']=entryList[i]['comment'];
            convertedSchemaObj['amount']=Number(entryList[i]['amount']);
            convertedSchemaObj['amountTypeId']=Number(entryList[i]['amountTypeId']);
            convertedSchema.push(convertedSchemaObj);
        }
        if(!errFlag){
            this.props.handleLoading(true);
            let data={
                apiPath:type==='submit'?'/recordTransaction':'/updateTransaction',
                type:'POST',
                query:null,
                payload:convertedSchema
            }
            apiCall(data)
            .then(res=>{
                this.props.handleLoading(false);
                this.handleRefresh();
                if(type==='submit'){
                    alert('successfully Recorded');                   
                }                    
                else{    
                    alert('successfully Updated');
                    this.props.onTabClick('Entry');
                }
                
            })
            .catch(err=>{
                this.props.handleLoading(false);
                console.log('err',err)
            });
        }

    }
    handleRefresh(){
        let entryList=[];
        entryList=[schemaGenerator('uiSchema','transaction')];
        entryList[0]['timeStamp']=new Date();
        this.setState({
            entryList,
        });

    }
    handleAddDel(type,ind){
        let {entryList}=this.state;
        if(type==='+')
            entryList.push(schemaGenerator('uiSchema','transaction'));
        else
            entryList.splice(ind,1);
        this.setState({
            entryList,
        });
    }
    handleOutsideClick(){
        var elements = document.getElementsByClassName("options");
        for(var i = 0; i < elements.length; i++)
        {
            let element=elements.item(i);
            element.classList.add("disp-none");
        }
    }
    webBuild(){
        try{
            return(
                <div className="record-container" >
                    {this.state.entryList.map((entry,ind)=>{
                        let filteredTransactionTypeSet=this.state.transactionTypeSet.filter(x=>{if(x.transactionClassification===entry['transactionClassification']){return x}});
                        return(
                            <div className="record-wrapper"  key={"entry"+ind}>
                                <div className="record" key={"entry"+ind}>
                                    <div className="record-item">                                
                                        <DatePicker
                                            key={"entry"+ind}
                                            ref={"entry"+ind}
                                            selected={entry['timeStamp']===''?'':new Date(entry['timeStamp'])}
                                            onChange={this.handleDateChange.bind(this,ind)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={60}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            timeCaption="time"
                                        />                                    
                                    </div>
                                    <div className="record-item">
                                        <select value={entry['transactionClassification']} onChange={this.handleChange.bind(this,'transactionClassification',ind)}>
                                            <option value="">Transaction Classification</option>
                                            {this.state.transactionClassificationSet.map((value,ind)=>{
                                                
                                                return(
                                                    <option key={"transactionClassification"+ind} value={value}>{value}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div className="record-item">
                                        <select value={entry['transactionTypeId']} onChange={this.handleChange.bind(this,'transactionTypeId',ind)}>
                                            <option value="">Transaction Type</option>
                                            {filteredTransactionTypeSet.map((value,ind)=>{                                            
                                                return(
                                                    <option key={"transactionType"+ind} value={value.transactionTypeId}>{value.transactionTypeName}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div className="record-item-half">
                                            <input type="text" ref={"amount"+ind} value={entry['amount']} placeholder={"Amount"} onChange={this.handleChange.bind(this,'amount',ind)} ></input>                           
                                            <select value={entry['amountTypeId']} onChange={this.handleChange.bind(this,'amountTypeId',ind)}>
                                                <option value="">Currency Type</option>
                                                {this.state.amountTypeSet.map((value,ind)=>{                                            
                                                    return(
                                                        <option key={"amountType"+ind} value={value.amountTypeId}>{value.amountSymbol}</option>
                                                    )
                                                })}
                                            </select>
                                    </div>
                                    <div className="record-item">
                                        <textarea type="text" className="comment" ref={"comment"+ind} value={entry['comment']} placeholder={"Description"} onChange={this.handleChange.bind(this,'comment',ind)} ></textarea>
                                    </div>                                                               
                                </div> 
                                <div className={this.props.toEditSet.length!==0?"hide":""} style={{paddingTop:this.addDelpadTop,paddingLeft:'20px',float:'left',fontSize:'30px',fontFamily:'monospace',color:'#aca3a3'}}>
                                        {((ind===this.state.entryList.length-1) && ind===0)?
                                            <span onClick={this.handleAddDel.bind(this,'+')}>+</span>                                        
                                        :
                                            (ind===this.state.entryList.length-1)?
                                                <span onClick={this.handleAddDel.bind(this,'+')}>+</span>
                                            :
                                                <span onClick={this.handleAddDel.bind(this,'-',ind)}>-</span>
                                        }
                                </div>    
                            </div> 
                        )
                    })}  
                    <div className="action-items">
                        <button type="button" onClick={this.props.toEditSet.length==0?this.handleSubmit.bind(this,'submit'):this.handleSubmit.bind(this,'update')}>{this.props.toEditSet.length===0?'Submit':'Update'}</button>
                        <button type="button" onClick={this.props.toEditSet.length==0?this.handleRefresh:()=>{this.handleRefresh();this.props.onTabClick('Entry')}}>Reset</button>
                    </div>                      
                </div>
            )
        }
        catch(err){
            console.log('error',err);
            return null;
        }
    }
    mBuild(){
        try{
            return(
                <div className="m-record-container" onClick={this.handleOutsideClick}>
                    {this.state.entryList.map((entry,ind)=>{
                        let filteredTransactionTypeSet=this.state.transactionTypeSet.filter(x=>{if(x.transactionClassification===entry['transactionClassification']){return x}});
                        filteredTransactionTypeSet=filteredTransactionTypeSet.filter((x)=>{
                            if(entry.transactionType!==''){
                                if(x.transactionTypeName.match(new RegExp('^'+entry.transactionType+'.*$', 'gi'))){
                                    //if(x.transactionTypeName!==entry.transactionType){
                                         return x;
                                    //}                                    
                                }
                            }
                        });
                     
                        return(
                            <div className="m-record-wrapper"  key={"entry"+ind}>
                                <div className="m-record" key={"entry"+ind}>
                                    <div className="m-record-item">                                
                                        <DatePicker
                                            key={"entry"+ind}
                                            ref={"entry"+ind}
                                            selected={entry['timeStamp']===''?'':new Date(entry['timeStamp'])}
                                            onChange={this.handleDateChange.bind(this,ind)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={60}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            timeCaption="time"
                                        />                                    
                                    </div>
                                    <div className="m-record-item">
                                        <select value={entry['transactionClassification']} onChange={this.handleChange.bind(this,'transactionClassification',ind)}>
                                            <option value="">Transaction Classification</option>
                                            {this.state.transactionClassificationSet.map((value,ind)=>{
                                                
                                                return(
                                                    <option key={"transactionClassification"+ind} value={value}>{value}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div className="m-record-item transactionType" >
                                        <input type="text" value={entry['transactionType']} onChange={this.handleChange.bind(this,'transactionType',ind)}></input>
                                        {/* <select value={entry['transactionTypeId']} onChange={this.handleChange.bind(this,'transactionTypeId',ind)}>
                                            <option value="">Transaction Type</option>
                                            {filteredTransactionTypeSet.map((value,ind)=>{                                            
                                                return(
                                                    <option key={"transactionType"+ind} value={value.transactionTypeId}>{value.transactionTypeName}</option>
                                                )
                                            })}
                                        </select> */}
                                        
                                        {filteredTransactionTypeSet.length>0 && 
                                            <div className="options">
                                                {filteredTransactionTypeSet.map((option,optionInd)=>{
                                                    return(
                                                        <div className="option"  key={'ComboOption'+optionInd} onClick={this.handleComboChange.bind(this,option,ind)}>
                                                            {option.transactionTypeName}
                                                            <span onClick={this.deleteTransactionType.bind(this,option.transactionTypeId)}>x</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>   
                                        }                                     
                                    </div>
                                    <div className="m-record-item amount">
                                        <input type="text" ref={"amount"+ind} value={entry['amount']} placeholder={"Amount"} onChange={this.handleChange.bind(this,'amount',ind)} ></input>                                                                       
                                    </div>
                                    <div className="m-record-item amount">
                                        <select value={entry['amountTypeId']} onChange={this.handleChange.bind(this,'amountTypeId',ind)}>
                                            <option value="">Currency Type</option>
                                            {this.state.amountTypeSet.map((value,ind)=>{                                            
                                                return(
                                                    <option key={"amountType"+ind} value={value.amountTypeId}>{value.amountSymbol}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div className="m-record-item">
                                        <textarea type="text" className="comment" ref={"comment"+ind} value={entry['comment']} placeholder={"Description"} onChange={this.handleChange.bind(this,'comment',ind)} ></textarea>
                                    </div>                                                               
                                </div> 
                                <div className={this.props.toEditSet.length!==0?"hide":""} style={{paddingTop:this.addDelpadTop,paddingLeft:'10px',float:'left',fontSize:'30px',fontFamily:'monospace',color:'#aca3a3'}}>
                                        {((ind===this.state.entryList.length-1) && ind===0)?
                                            <span onClick={this.handleAddDel.bind(this,'+')}>+</span>                                        
                                        :
                                            (ind===this.state.entryList.length-1)?
                                                <span onClick={this.handleAddDel.bind(this,'+')}>+</span>
                                            :
                                                <span onClick={this.handleAddDel.bind(this,'-',ind)}>-</span>
                                        }
                                </div>    
                            </div> 
                        )
                    })}  
                    <div className="m-action-items">
                        <button type="button" onClick={this.props.toEditSet.length==0?this.handleSubmit.bind(this,'submit'):this.handleSubmit.bind(this,'update')}>{this.props.toEditSet.length===0?'Submit':'Update'}</button>
                        <button type="button" onClick={this.props.toEditSet.length==0?this.handleRefresh:()=>{this.handleRefresh();this.props.onTabClick('Entry')}}>Reset</button>
                    </div>                      
                </div>
            )
        }
        catch(err){
            console.log('error',err);
            return null;
        }
    }
    render(){
        
        if(isMobile())
            return this.mBuild();
        else    
            return this.webBuild();
        
    }
}