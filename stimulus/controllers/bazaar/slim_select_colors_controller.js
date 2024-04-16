import SlimSelectController from '../slim_select_controller'

export default class extends SlimSelectController {

    static values = {
        ...super.values,
        data: Array
    }

    static targets = ["select"]


    getOptionsForSlimSelect() {

        const options = super.getOptionsForSlimSelect()
        
        // https://slimselectjs.com/options , pozriet InnerHTML
        options.data = this.dataValue

        return options
    }

    

}

