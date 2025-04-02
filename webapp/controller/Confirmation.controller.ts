import Controller from "sap/ui/core/mvc/Controller";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Input from "sap/m/Input";
import JSONModel from "sap/ui/model/json/JSONModel";
import { loadView } from "../utils/load-utils";
import Toolbar from "sap/m/Toolbar";
import { ValueState } from "sap/ui/core/library";
import MessageBox from "sap/m/MessageBox";
import Int from "sap/ui/model/odata/type/Int";
import Table from "sap/m/Table";
import ListItem from "sap/ui/core/ListItem";
import Page from "sap/m/Page";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Dialog from "sap/m/Dialog";
import Text from "sap/m/Text";
import Button from "sap/m/Button";
import ControlConfiguration from "sap/ui/comp/smartfilterbar/ControlConfiguration";
import ElementRegistry from "sap/ui/core/ElementRegistry";
/**
 * @namespace de.sycor.packtable.controller
 */
export default class Confirmation extends Controller {

    private resourceBundle: ResourceBundle;
    private viewController: Controller;
    private _oHUModel: JSONModel;
    private _oHUModel2: JSONModel;
    private _oFilterFired: Boolean;
    public onInit(): void {
        document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("idTargetLocationInput") as Input; 
            const element = e.target as HTMLElement;
      
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });

        this.viewController = this.getOwnerComponent()?.getModel("viewController")?.getObject("/") as Controller;
        this.resourceBundle = (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;

        //Get Global HUModel
        this._oHUModel = sap.ui.getCore().getModel("HUModel") as JSONModel;
        this._oHUModel2 = sap.ui.getCore().getModel("HUModel2") as JSONModel;
        this.getView().setModel(this._oHUModel, "HUModel");
        this.getView().setModel(this._oHUModel2, "HUModel2");

        //Flag for Fitler fired
        this._oFilterFired = false as Boolean;
        
    }

    public back(): void {
        loadView("Start", this.viewController);
        document.removeEventListener('keydown', (e: Event) => {
        });
    }

    public submit() : void{
        if(this._oHUModel.getProperty("/Action") === "E"){
            this.submitPacking();
        }else{
            this.submitUnpacking();
        }
    }

    public submitPacking(): void {
      const page = this.byId("pageId") as Page;

      const model = this.getOwnerComponent()?.getModel() as ODataModel;
      const contr = this;
      
      
      page.setBusy(true);
      
      var entry = {};
      entry.Uhu = this._oHUModel.getProperty("/Huident");
      entry.UhuGuid = this._oHUModel.getProperty("/GuidHu");
      entry.Hhu = this._oHUModel2.getProperty("/Huident");
      entry.HhuGuid = this._oHUModel2.getProperty("/GuidHu");
      entry.Action = this._oHUModel.getProperty("/Action");

      console.log(entry);

      //Check if one Sub-Hu is already inside the Main-HU
      model.read("/HURepackSet", {
        filters : [
          new Filter("Huident", FilterOperator.EQ, this._oHUModel2.getProperty("/Huident")),
          new Filter("GuidHu", FilterOperator.EQ, this._oHUModel2.getProperty("/GuidHu"))
        ], success :(data: any) => {

          if(data.results.length > 0){
            //Open Confirmation Dialog
            let confDialog = new Dialog({
              title : this.resourceBundle.getText("confirmation.dialog.packing.title"),
              type : "Message",
              state : "Warning",
              icon : "sap-icon://status-critical",
              content: [
                new Text({ text : this.resourceBundle.getText("confirmation.dialog.unpacking.text",[this._oHUModel.getProperty("/Vlgpla"), this._oHUModel2.getProperty("/Vlgpla")]) + "\n" + this.resourceBundle.getText("confirmation.dialog.packing.text")})
              ],
              beginButton : new Button({
                text : this.resourceBundle.getText("repack2.buttons.abort"),
                press  : function() : void {
                  confDialog.close();
                  page.setBusy(false);
                }
              }),
              endButton : new Button({
                text : this.resourceBundle.getText("repack2.buttons.confirm"),
                press : function() : void {
                  contr._processSubmitPacking(entry, false);
                  confDialog.close();
                }
              }),
              afterClose : function() : void{
                confDialog.destroy();
              }
              
            });

            confDialog.open();
          }else{
             //Nothing inside then go ahead
             this._processSubmitPacking(entry, true);

          }
        },error: (error : any) => {

          console.log(error);
          let oResponseText = JSON.parse(error.responseText);
          let sErrorText = oResponseText.error.message.value || "start.errors.internal-errorrepack.errors.internal-error";
          MessageBox.error(sErrorText);
          page.setBusy(false);
        }
      });

      }

      public _processSubmitPacking(entry : any, showSecondDialog: boolean) : void {
        const page = this.byId("pageId") as Page;
        const contr = this;
        const model = this.getOwnerComponent()?.getModel() as ODataModel;

          if(showSecondDialog){
           //Open Confirmation Dialog
           let confDialogPacking = new Dialog({
            title : this.resourceBundle.getText("confirmation.dialog.unpacking.title", [entry.Uhu]),
            type : "Message",
            state : "Information",
            icon : "sap-icon://information",
            content: [
              new Text({ text : this.resourceBundle.getText("confirmation.dialog.unpacking.text", [this._oHUModel.getProperty("/Vlgpla"), this._oHUModel2.getProperty("/Vlgpla")])})
            ],
            beginButton : new Button({
              text : this.resourceBundle.getText("repack2.buttons.abort"),
              press  : function() : void {
                confDialogPacking.close();
                page.setBusy(false);
              }
            }),
            endButton : new Button({
              text : this.resourceBundle.getText("repack2.buttons.confirm"),
              press : function() : void {

                model.create("/HURepackSet", entry, {
                  success: (data: any) => {
        
                      MessageBox.success(contr.resourceBundle.getText("confirmation.messagebox.success.text", [entry.Uhu, entry.Hhu, contr._oHUModel.getProperty("/Vlgpla"), contr._oHUModel2.getProperty("/Vlgpla")]) as string, {
                          title: contr.resourceBundle.getText("confirmation.messagebox.success.title"),
                          onClose: () => {
                              loadView("Start", contr.viewController);
                          }
                      });
        
                  },
                  error: (error: any) => {
                   
                  console.log(error);
                  let oResponseText = JSON.parse(error.responseText);
                  let sErrorText = oResponseText.error.message.value || "start.errors.internal-errorrepack.errors.internal-error";
                  MessageBox.error(sErrorText);
                  page.setBusy(false);
                     
                     
                  }
              });

              confDialogPacking.close();
              }
            }),
            afterClose : function() : void{
              confDialogPacking.destroy();
            }
            
          });

          confDialogPacking.open(); 

        }else{
          model.create("/HURepackSet", entry, {
            success: (data: any) => {
  
                MessageBox.success(contr.resourceBundle.getText("confirmation.messagebox.success.text", [entry.Uhu, entry.Hhu, contr._oHUModel.getProperty("/Vlgpla"), contr._oHUModel2.getProperty("/Vlgpla")]) as string, {
                    title: contr.resourceBundle.getText("confirmation.messagebox.success.title"),
                    onClose: () => {
                        loadView("Start", contr.viewController);
                    }
                });
  
            },
            error: (error: any) => {
             
            console.log(error);
            let oResponseText = JSON.parse(error.responseText);
            let sErrorText = oResponseText.error.message.value || "start.errors.internal-errorrepack.errors.internal-error";
            MessageBox.error(sErrorText);
            page.setBusy(false);
               
               
            }
        });          
        }

      }

      public submitUnpacking() : void {
        let input = this.byId("idTargetLocationInput") as Input;
        const page = this.byId("pageId") as Page;
        
        const contr = this;

        if (!input.getValue() && !input.getSelectedKey()) {
            input.setValueState(ValueState.Error);
            input.setValueStateText(
              this.resourceBundle.getText("confirmation.errors.input-empty") as string
            );
            input.openValueStateMessage();
      
            return;
        }

        //Check if Scanned Target Location really belongs to Sub HU
        if(this._oHUModel.getProperty("/Action") === "A"){
            if(!this._checkTargetLocation(input.getValue())){
            input.setValueState(ValueState.Error);
            input.setValueStateText(
                this.resourceBundle.getText("confirmation.errors.wrong-targetLocation") as string
            );
            input.openValueStateMessage();
        
            return;
            }
        }


        page.setBusy(true);
        
        var entry = {};
        entry.Uhu = this._oHUModel2.getProperty("/Huident");
        entry.UhuGuid = this._oHUModel2.getProperty("/GuidHu");
        entry.Hhu = this._oHUModel.getProperty("/Huident");
        entry.HhuGuid = this._oHUModel.getProperty("/GuidHu");
        entry.Action = this._oHUModel.getProperty("/Action");
        entry.Nlgpla = input.getValue();
 
  
        console.log(entry);

           //Open Confirmation Dialog
           let confDialogUnpacking = new Dialog({
            title : this.resourceBundle.getText("confirmation.dialog.unpacking.title", [entry.Uhu]),
            type : "Message",
            state : "Information",
            icon : "sap-icon://information",
            content: [
              new Text({ text : this.resourceBundle.getText("confirmation.dialog.unpacking.text", [this._oHUModel2.getProperty("/Vlgpla"), entry.Nlgpla])})
            ],
            beginButton : new Button({
              text : this.resourceBundle.getText("repack2.buttons.abort"),
              press  : function() : void {
                confDialogUnpacking.close();
                page.setBusy(false);
              }
            }),
            endButton : new Button({
              text : this.resourceBundle.getText("repack2.buttons.confirm"),
              press : function() : void {
                contr._processSubmitUnPacking(entry);
                confDialogUnpacking.close();
              }
            }),
            afterClose : function() : void{
              confDialogUnpacking.destroy();
            }
            
          });

        confDialogUnpacking.open(); 
  
      
      }

      public _processSubmitUnPacking(entry : any) : void {
        const page = this.byId("pageId") as Page;
        const model = this.getOwnerComponent()?.getModel() as ODataModel;

        model.create("/HURepackSet", entry, {
          success: (data: any) => {

              MessageBox.success(this.resourceBundle.getText("confirmation.unpack.messagebox.success.text", [entry.Uhu,this._oHUModel2.getProperty("/Vlgpla"), entry.Nlgpla]) as string, {
                  title: this.resourceBundle.getText("confirmation.messagebox.success.title"),
                  onClose: () => {
                      loadView("Start", this.viewController);
                  }
              });

          },
          error: (error: any) => {
           
          console.log(error);
          let oResponseText = JSON.parse(error.responseText);
          let sErrorText = oResponseText.error.message.value || "start.errors.internal-errorrepack.errors.internal-error";
          MessageBox.error(sErrorText);
          page.setBusy(false);
                       
          }
      });
      }

      public onTargetLocationTableUpdateFinished(oEvent: any) : void {
        let table = oEvent.getSource() as Table;
        let itemCount = oEvent.getParameter("actual") as Int;

        //If Filter Fired and no Entries show Error Message. Else Filter Table for Sub-HU
        if(!this._oFilterFired && this._oHUModel.getProperty("/Action") === "A"){
          //Filter HURepackSet to get SubHU's
          let oFilter = new Filter("Matnr", FilterOperator.EQ, this._oHUModel2.getProperty("/Matnr"));
          table.getBinding("items").filter(oFilter);
          this._oFilterFired = true;
        }else if(this._oFilterFired && itemCount === 0){
          MessageBox.error(this.resourceBundle.getText("confirmation.errors.no-targetlocation"));
        }       
      }

      public inputChange(): void {
        var input = this.byId("idTargetLocationInput") as Input;
   
        if (!input) return;
    
        input.setValueState(ValueState.None);
        input.closeValueStateMessage();
    
        input.setValue(input.getValue().trim().toUpperCase());
      }

      public _checkTargetLocation(oTargetLocation:any) {
        let table = this.getView().byId("idTargetLocationTable") as Table;
        let oItems = table.getItems();
        let checkPassed = false as Boolean;
        //Loop Through items and check if TargetLocation is avalable
        for(var i in oItems){
          if(oItems[i].getBindingContext()?.getProperty("Lgpla") === oTargetLocation){
            checkPassed = true;
          }
        }

        return checkPassed;
      }

      public onTargetLocationItemPress(oEvent:any) : void {
        let oItem = oEvent.getParameter("listItem") as ListItem;
        let input = this.byId("idTargetLocationInput") as Input;

        //Set Selected HU into Input Field
        input.setValue(oItem.getBindingContext()?.getProperty("Lgpla"));
        //Fire Submit
        input.fireSubmit();       
      }
}