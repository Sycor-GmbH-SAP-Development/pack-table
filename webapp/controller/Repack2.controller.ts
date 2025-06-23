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
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Int from "sap/ui/model/odata/type/Int";
import Table from "sap/m/Table";
import ListItem from "sap/ui/core/ListItem";
import Item from "sap/ui/core/Item";
import Page from "sap/m/Page";
import MessageToast from "sap/m/MessageToast";
/**
 * @namespace de.sycor.packtable.controller
 */
export default class Repack2 extends Controller {

    private resourceBundle: ResourceBundle;
    private viewController: Controller;
    private _oHUModel: JSONModel;
    private _oHUModel2: JSONModel;
    private _oFilterFired: Boolean;
    private _page: Page;

    public onInit(): void {
        document.addEventListener("keydown", (e: Event) => {
          var input = this.byId("createHUPMat") as Input;
          if(this._oHUModel.getProperty("/Action") === "A"){
            input = this.byId("createHUPMat") as Input;
          }   
          const element = e.target as HTMLElement;
    
          if (input && element.tagName !== "INPUT") {
            input.setValue("");
            input.focus();
          }
        });
        this._page = this.getView().byId("pageId") as Page;
        this.viewController = this.getOwnerComponent()?.getModel("viewController")?.getObject("/") as Controller;
        this.resourceBundle = (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;

        //Get Global HUModel
        this._oHUModel = sap.ui.getCore().getModel("HUModel") as JSONModel;
        this.getView().setModel(this._oHUModel, "HUModel");

        //Set Form Visibility and Focus according to Mode
        if(this._oHUModel.getProperty("/Action") === "A"){

          //Create HU
          this.getView().byId("formCreateHU").setVisible(true);
          //this.getView().byId("form0_unpack").setVisible(false);

          //Create Template for Combobox
          var oPakMatTemplate = new Item({key:"{Matnr}",text:"{Matnr} - ({Maktx})"});

          this.byId("createHUPMat").bindItems({
            path:"/PackagingMaterialSet",
            template: oPakMatTemplate,
                  length: 1000
          });

     
          //Set Default Value to 1
          this.getView().byId("createHUQuan").setValue(1);
          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("createHUPMat") as Input;
            const element = e.target as HTMLElement;
            
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });

          
        }else if(this._oHUModel.getProperty("/Action") === "B"){

          //Reset screen
          if(this._oHUModel.getProperty("/Scan") === 'LP' || this._oHUModel.getProperty("/Bottom") !== 'X'){
            this._oHUModel.setProperty("/Matnr", "");
            this.getView().byId("repackMatnr").setValue("");
            this._oHUModel.setProperty("/Menge", "");
            this.getView().byId("repackQuan").setValue("");
            this._oHUModel.setProperty("/Meins", "");
            this.getView().byId("repackQuanUnit").setText("");
            this._oHUModel.setProperty("/PmatGuid", "");
            this.getView().byId("changeHUPMat").setSelectedKey("");     
            
            MessageToast.show(this.resourceBundle.getText("multipleSubHu"),{
              duration : 3000
            });
          }


          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("repackHUTo") as Input;
            const element = e.target as HTMLElement;

            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });          
        }else if(this._oHUModel.getProperty("/Action") === "C"){

          var oPakMatChangeTemplate = new Item({key:"{Matnr}",text:"{Matnr} - ({Maktx})"});
          this.byId("changeHUPMat").bindItems({
            path:"/PackagingMaterialSet",
            template: oPakMatChangeTemplate,
                  length: 1000
          });   
                    
          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("changeHU") as Input;
            const element = e.target as HTMLElement;           
      
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });          
        }
        
    }

    public TableUpdateFinished(oEvent : any): void {

      if(this._oHUModel.getProperty("/Action") === "B" && oEvent.getParameter("total") === 0){
        let oHuTable = this.getView().byId("idUHUTable") as Table;
    
        var oFilter: Filter;
        var oFilters : Array;
        oFilters = [];
        if(this._oHUModel.getProperty("/Scan") === 'LP'){
          oFilter = new Filter("Scan", FilterOperator.EQ, this._oHUModel.getProperty("/Lgpla"));
          oFilters.push(oFilter);
          oFilters.push(new Filter("Bottom", FilterOperator.EQ, "X"));
          oHuTable.getBinding("items").filter(oFilters);
          //Reset screen
          this._oHUModel.setProperty("/Huident", "");
          this.getView().byId("repackHUFrom").setSelectedKey("");           
        }else if(this._oHUModel.getProperty("/Bottom") !== 'X'){
          oFilter = new Filter("Scan", FilterOperator.EQ, this._oHUModel.getProperty("/Huident"));
          oFilters.push(oFilter);
          oFilters.push(new Filter("Bottom", FilterOperator.EQ, "X"));
          oHuTable.getBinding("items").filter(oFilters);   
          //Reset screen
          this._oHUModel.setProperty("/Huident", "");
          this.getView().byId("repackHUFrom").setSelectedKey("");             
        }        
      }
      
     
    }

    public back(): void {
        loadView("Start", this.viewController);
        document.removeEventListener('keydown', (e: Event) => {
        });
    }

    // eslint-disable-next-line max-statements
    public submit(): void {
      const model = this.getOwnerComponent()?.getModel() as ODataModel;
      const toolbar = this.byId("toolbar") as Toolbar;

      if(this._oHUModel.getProperty("/Action") === "A"){
        var inputPmat = this.byId("createHUPMat") as Input;
        var inputQuan = this.byId("createHUQuan") as Input;

        if(!inputPmat.getValue() && !inputPmat.getSelectedKey()){
          inputPmat.setValueState(ValueState.Error);
          inputPmat.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputPmat.openValueStateMessage();
    
          return;          
        }


        if(!inputQuan.getValue() && !inputQuan.getValue() < 1){
          inputQuan.setValueState(ValueState.Error);
          inputQuan.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputQuan.openValueStateMessage();
    
          return;          
        }  
        
        this._page.setBusy(true);
        toolbar.setBusy(true);

        var entry = this._oHUModel.getData();
        entry.Matnr = inputPmat.getSelectedKey();
        entry.Anzahl = parseInt(inputQuan.getValue());
        entry.PmatGuid = "";

        model.create("/PackagingTableSet", entry, {
          success: (data: any) => {
  
              MessageBox.success(this.resourceBundle.getText("confirmation.dialog.createHU.text") + " " + data.HusCreated, {
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
          this._page.setBusy(false);
             
          }
      });
      } else if(this._oHUModel.getProperty("/Action") === "B"){
        var inputHuVon = this.byId("repackHUFrom") as Input;
        var inputHuTo = this.byId("repackHUTo") as Input;
        var inputMat = this.byId("repackMatnr") as Input;
        var inputMenge = this.byId("repackQuan") as Input;

        if(!inputHuVon.getValue()){
          inputHuVon.setValueState(ValueState.Error);
          inputHuVon.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputHuVon.openValueStateMessage();
    
          return;          
        }

        if(!inputHuTo.getValue()){
          inputHuTo.setValueState(ValueState.Error);
          inputHuTo.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputHuTo.openValueStateMessage();
    
          return;          
        }
        
        if(!inputMat.getValue()){
          inputMat.setValueState(ValueState.Error);
          inputMat.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputMat.openValueStateMessage();
    
          return;          
        }
        
        if(!inputMenge.getValue()){
          inputMenge.setValueState(ValueState.Error);
          inputMenge.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputMenge.openValueStateMessage();
    
          return;          
        } 
        this._page.setBusy(true);
        toolbar.setBusy(true);

        entry = this._oHUModel.getData();
        entry.Matnr = inputMat.getValue();
        entry.Menge = inputMenge.getValue();
        entry.Nhuident = inputHuTo.getValue();
        entry.Huident = inputHuVon.getValue();
        entry.PmatGuid = "";
        model.create("/PackagingTableSet", entry, {
          success: (data: any) => {
  
              MessageBox.success(data.HusCreated, {
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
          this._page.setBusy(false);
             
          }
      });
       
        
      }else if(this._oHUModel.getProperty("/Action") === "C"){
        var inputPmat = this.byId("changeHUPMat") as Input;
        var inputHu = this.byId("changeHU") as Input;

        if(!inputPmat.getValue() && !inputPmat.getSelectedKey()){
          inputPmat.setValueState(ValueState.Error);
          inputPmat.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputPmat.openValueStateMessage();
    
          return;          
        }


        if(!inputHu.getValue()){
          inputHu.setValueState(ValueState.Error);
          inputHu.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          inputHu.openValueStateMessage();
    
          return;          
        }  
        
        this._page.setBusy(true);
        toolbar.setBusy(true);

        var entry = this._oHUModel.getData();
        entry.Matnr = inputPmat.getSelectedKey();
        entry.PmatGuid = "";
        entry.Huident = inputHu.getValue();

        model.create("/PackagingTableSet", entry, {
          success: (data: any) => {
  
              MessageBox.success(data.HusCreated, {
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
          this._page.setBusy(false);
             
          }
      });
      }


      
      


      }
      
      public onUHUTableItemPress(oEvent: any): void{
        let oItem = oEvent.getParameter("listItem");

        this._oHUModel.setProperty("/Huident", oItem.getBindingContext().getProperty("Huident"));

        this.getView().byId("repackHUFrom").setValue(oItem.getBindingContext().getProperty("Huident"));
        this.getView().byId("repackHUFrom").fireSubmit();
      }

      public submitHU(oEvent : any): void {
         var input = oEvent.getSource();
    
        const model = this.getOwnerComponent()?.getModel() as ODataModel;
        
        var oFilter = new Filter("Scan", FilterOperator.EQ, input.getValue()) as Filter;
        
        this._oHUModel.setProperty("/Matnr", "");
        this.getView().byId("repackMatnr").setValue("");
        this._oHUModel.setProperty("/Menge", "");
        this.getView().byId("repackQuan").setValue("");
        this._oHUModel.setProperty("/Meins", "");
        this.getView().byId("repackQuanUnit").setText("");
        this._oHUModel.setProperty("/PmatGuid", "");
        this.getView().byId("changeHUPMat").setSelectedKey("");
        this._oHUModel.setProperty("/Scan", "");
        this._oHUModel.setProperty("/Bottom", "");
        model.read("/PackagingTableSet", {
          success: (data: any) => {
            if (data.results.length === 0) {
              input.setValueState(ValueState.Error);
              input.setValueStateText(
                this.resourceBundle.getText("repack.errors.huloc-exists") as string
              );
              input.openValueStateMessage();
        
              return;
            }else{
              input.setValueState(ValueState.None);
              input.setValueStateText(
                ""
              );
              input.closeValueStateMessage();

              this._oHUModel.setProperty("/Matnr", data.results[0].Matnr);
              this.getView().byId("repackMatnr").setValue(data.results[0].Matnr);
              this._oHUModel.setProperty("/Menge", data.results[0].Menge);
              this.getView().byId("repackQuan").setValue(this.normalizeFormatter(data.results[0].Menge));
              this._oHUModel.setProperty("/Meins", data.results[0].Meins);
              this.getView().byId("repackQuanUnit").setText(data.results[0].Meins);
              this._oHUModel.setProperty("/PmatGuid", data.results[0].PmatGuid);
              this.getView().byId("changeHUPMat").setSelectedKey(data.results[0].PmatGuid);
              this._oHUModel.setProperty("/Scan", data.results[0].Scan);
              this._oHUModel.setProperty("/Bottom", data.results[0].Bottom);
              
              //Reset Sub-HU table
              this.getView().byId("idUHUTable").getBinding("items").filter(null);
              this.getView().byId("idUHUTable").getModel().refresh(true);
              this.onInit();
              
            }
  
          },
          error: (error: any) => {
            console.log(error);
    
            if (error.statusCode == 500)
              MessageBox.error(
                this.resourceBundle.getText(
                  "repack.errors.internal-error"
                ) as string,
                {
                  title: this.resourceBundle.getText(
                    "repack.messagebox.error.title"
                  ) as string
                }
              );
            else {
              input.setValueState(ValueState.Error);
              input.setValueStateText(
                this.resourceBundle.getText("repack.errors.huloc-exists") as string
              );
              input.openValueStateMessage();
            }
    
          }, filters : [oFilter]
        });

        
      }

      public normalizeFormatter(number: string): string {
        return parseFloat(number).toString();
      } 

      public HUInputChange(): void {
        var input = this.byId("idHauptHUInput") as Input;
        if(this._oHUModel.getProperty("/Action") === "A"){
          input = this.byId("idUnterHUInput2") as Input;
        }   
        
        if (!input) return;
    
        input.setValueState(ValueState.None);
        input.closeValueStateMessage();
    
        input.setValue(input.getValue().trim().toUpperCase());
      }




}