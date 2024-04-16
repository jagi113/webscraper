import SelectController from "../slim_select_controller"

export default class extends SelectController {

    static values = {
        ...super.values,
        url: String,
        containerid: String,
        loadingtext: {
            type: String,
            default: '...'
        }
    }

    submitBtnId = 'bazaar-submit-button'
    turboFrameId = 'properties-frame'

    disableBtn = () =>  {
        const btn = document.getElementById(this.submitBtnId)
        if (btn) {
            btn.setAttribute('disabled', 'true')
        }
    }

    enableBtn = () => {
        const btn = document.getElementById(this.submitBtnId)
        if (btn) {
            btn.removeAttribute('disabled')
        }
    }

    checkForTurboLoadEvent = (e) => {
        if (e.target.id === this.turboFrameId) {
             this.enableBtn()  
        }
    }

    getOptionsForSlimSelect() {
        
        return {
            ...super.getOptionsForSlimSelect(),
            onChange: (info) => {
                
                const container = document.getElementById(this.containeridValue)
                const url = `${this.urlValue}?server_category=${info.value}`
                
                this.disableBtn()

                if (container){ 
                    container.innerHTML = `
                        <turbo-frame 
                            id="${this.turboFrameId}" 
                            src="${url}"
                        >
                            <div class="text-gray-700 my-4">${this.loadingtextValue}</div>
                        </turbo-frame>
                    `
                }

                
                document.addEventListener('turbo:frame-load', this.checkForTurboLoadEvent)
            }
        }
    }

    disconnect() {
        super.disconnect()
        document.removeEventListener("turbo:frame-load", this.checkForTurboLoadEvent)
    }

}
