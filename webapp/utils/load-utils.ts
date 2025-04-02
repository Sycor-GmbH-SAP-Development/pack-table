import Dialog from "sap/m/Dialog";
import Controller from "sap/ui/core/mvc/Controller";
import XMLView from "sap/ui/core/mvc/XMLView";
import HorizontalLayout from "sap/ui/layout/HorizontalLayout";

export const NAMESPACE = "de.sycor.packtable";

/**
 * @namespace de.sycor.packtable.utils
 */
export function loadView(sViewName: string, controller: Controller): void {

    const v = () => XMLView.create({
        viewName: `${NAMESPACE}.view.${sViewName}`
    }).then((oView: XMLView) => {

        const oPage = controller?.byId("pageId") as HorizontalLayout;

        oPage.removeAllContent();
        oPage.insertContent(oView.getContent()[0], 0);

    });

    controller.getOwnerComponent()?.runAsOwner(v);

}
