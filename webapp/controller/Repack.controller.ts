import Controller from "sap/ui/core/mvc/Controller";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Input from "sap/m/Input";
import JSONModel from "sap/ui/model/json/JSONModel";
import { loadView } from "../utils/load-utils";
import Toolbar from "sap/m/Toolbar";
import { ValueState } from "sap/ui/core/library";
import MessageBox from "sap/m/MessageBox";
import Page from "sap/m/Page";
/**
 * @namespace de.sycor.hurepack.controller
 */
export default class Repack extends Controller {

    private resourceBundle: ResourceBundle;
    private viewController: Controller;
    private _oHUModel: JSONModel;
    private _oHUModel2: JSONModel;
    private _page: Page;

    public onInit(): void {

        this.viewController = this.getOwnerComponent()?.getModel("viewController")?.getObject("/") as Controller;
        this.resourceBundle = (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;

        //Get Global HUModel
        this._oHUModel = sap.ui.getCore().getModel("HUModel") as JSONModel;

        this._page = this.byId("pageId");
       

        //Set Form Visibility and Focus according to Mode
        if(this._oHUModel.getProperty("/Action") === "A"){
          //CreateHU
          this.getView().byId("form_createHU").setVisible(true);
          this.getView().byId("form_repackHU").setVisible(false);
          this.getView().byId("form_changeHU").setVisible(false);
          this.getView().byId("form_printHU").setVisible(false);

          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("idHuLocInput") as Input;
            const element = e.target as HTMLElement;
      
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });
        }else if(this._oHUModel.getProperty("/Action") === "B"){
          //Unpacking
          this.getView().byId("form_createHU").setVisible(false);
          this.getView().byId("form_repackHU").setVisible(true);
          this.getView().byId("form_changeHU").setVisible(false);
          this.getView().byId("form_printHU").setVisible(false);

          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("idHuLocInput2") as Input;
            const element = e.target as HTMLElement;
      
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });
        }else if(this._oHUModel.getProperty("/Action") === "C"){
          //Unpacking
          this.getView().byId("form_createHU").setVisible(false);
          this.getView().byId("form_repackHU").setVisible(false);
          this.getView().byId("form_changeHU").setVisible(true);
          this.getView().byId("form_printHU").setVisible(false);

          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("idHuLocInput3") as Input;
            const element = e.target as HTMLElement;
      
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });
        }  else if(this._oHUModel.getProperty("/Action") === "D"){
          //Unpacking
          this.getView().byId("form_createHU").setVisible(false);
          this.getView().byId("form_repackHU").setVisible(false);
          this.getView().byId("form_changeHU").setVisible(false);
          this.getView().byId("form_printHU").setVisible(true);

          document.addEventListener("keydown", (e: Event) => {
            let input = this.byId("idHuLocInput4") as Input;
            const element = e.target as HTMLElement;
      
            if (input && element.tagName !== "INPUT") {
              input.setValue("");
              input.focus();
            }
          });
        }       
    }

    public back(): void {
        loadView("Start", this.viewController);
        document.removeEventListener('keydown', (e: Event) => {
        });
    }

    public submitLPHU(): void {
        var input = this.byId("idHuLocInput") as Input;
        if(this._oHUModel.getProperty("/Action") === "A"){
          input = this.byId("idHuLocInput") as Input;
        }else if(this._oHUModel.getProperty("/Action") === "B"){
          input = this.byId("idHuLocInput2") as Input;
        }else if(this._oHUModel.getProperty("/Action") === "C"){
          input = this.byId("idHuLocInput3") as Input;
        }else if(this._oHUModel.getProperty("/Action") === "D"){
          input = this.byId("idHuLocInput4") as Input;
        }
        const toolbar = this.byId("toolbar") as Toolbar;
    
        if (!input.getValue() && !input.getSelectedKey()) {
          input.setValueState(ValueState.Error);
          input.setValueStateText(
            this.resourceBundle.getText("repack.errors.input-empty") as string
          );
          input.openValueStateMessage();
    
          return;
        }
    
        input.setBusy(true);
        toolbar.setBusy(true);
    
        const model = this.getOwnerComponent()?.getModel() as ODataModel;
        
        var oFilter = new Filter("Scan", FilterOperator.EQ, input.getValue()) as Filter;

        model.read("/PackagingTableSet", {
          success: (data: any) => {
            if (data.results.length === 0) {
              input.setValueState(ValueState.Error);
              input.setValueStateText(
                this.resourceBundle.getText("repack.errors.huloc-exists") as string
              );
              input.openValueStateMessage();
    
              input.setBusy(false);
              toolbar.setBusy(false);
    
              return;
            }
    
            console.log(data.results);

            var oEntry = data.results[0];
            oEntry.Action = this._oHUModel.getProperty("/Action");
            
            data.Action = this._oHUModel.getProperty("/Action");
            this._oHUModel.setData(oEntry);

            document.removeEventListener("keydown", (e: Event) => {
            });

            if(oEntry.Action !== "D"){
              loadView("Repack2", this.viewController);  
            }else{
              //PrintHU
              this.printHu(oEntry);
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
    
            input.setBusy(false);
            toolbar.setBusy(false);
          }, filters : [oFilter]
        });
      }

      public LPHUInputChange(): void {
        var input = this.byId("idHuLocInput") as Input;
        if(this._oHUModel.getProperty("/Action") === "A"){
          input = this.byId("idHuLocInput") as Input;
        }else if(this._oHUModel.getProperty("/Action") === "B"){
          input = this.byId("idHuLocInput2") as Input;
        }else if(this._oHUModel.getProperty("/Action") === "C"){
          input = this.byId("idHuLocInput3") as Input;
        }

        if (!input) return;
    
        input.setValueState(ValueState.None);
        input.closeValueStateMessage();
    
        input.setValue(input.getValue().trim().toUpperCase());
      }

      public printHu(oEntry: any) : void{
        const toolbar = this.byId("toolbar") as Toolbar;
        var oInput = this.byId("idHuLocInput4");
        const model = this.getOwnerComponent()?.getModel() as ODataModel;
        if(!oInput.getValue()){
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(
            this.resourceBundle.getText("repack2.errors.input-empty") as string
          );
          oInput.openValueStateMessage();
    
          return;   
        }

        this._page.setBusy(true);
        toolbar.setBusy(true);

        oEntry.Huident = oInput.getValue();
        oEntry.PmatGuid = "";
        model.create("/PackagingTableSet", oEntry, {
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