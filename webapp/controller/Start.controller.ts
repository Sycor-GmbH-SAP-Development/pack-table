import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import { loadView } from "../utils/load-utils";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
/**
 * @namespace de.sycor.packtable.controller
 */


export default class Start extends Controller {
  private _oHUModel: JSONModel;
  private _oHUModel2: JSONModel;
  private viewController: Controller;
  private resourceBundle: ResourceBundle;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
 
          document.body.classList.remove("sapUiSizeCompact");
          document.body.classList.add("sapUiSizeCozy");

          this.getOwnerComponent()?.setModel(new JSONModel(this), "viewController");

          var oHUModel =  new JSONModel({
              Action: ""
            }) as JSONModel;
          //Set Model Globaly
          this._oHUModel = oHUModel as JSONModel;
          sap.ui.getCore().setModel(oHUModel, "HUModel");

          var oHUModel2 =  new JSONModel() as JSONModel;
          //Set Model Globaly
          this._oHUModel2 = oHUModel2 as JSONModel;
          sap.ui.getCore().setModel(oHUModel2, "HUModel2");

          this.viewController = this.getOwnerComponent()
          ?.getModel("viewController")
          ?.getObject("/") as Controller;
        this.resourceBundle = (
          this.getOwnerComponent()?.getModel("i18n") as ResourceModel
        ).getResourceBundle() as ResourceBundle;
    }



    public onCreateHUPress() : void{
      //Set Pack Action in Model
      this._oHUModel.setProperty("/Action", "A");
      //Nav to Create HU View
      loadView("Repack", this.viewController);
    }

    public onRepackPress() : void{
      //Set Pack Action in Model
      this._oHUModel.setProperty("/Action", "B");
      //Nav to Create HU View
      loadView("Repack", this.viewController);
    }

    
    public onPMChangePress() : void{
      //Set Pack Action in Model
      this._oHUModel.setProperty("/Action", "C");
      //Nav to Create HU View
      loadView("Repack", this.viewController);
    }

    
    public onPrintHUPress() : void{
      //Set Pack Action in Model
      this._oHUModel.setProperty("/Action", "D");
      //Nav to Create HU View
      loadView("Repack", this.viewController);
    }

    
    
}