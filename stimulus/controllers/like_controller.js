import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["counter", "buttonText", "likers", "icon", "iconLikers", "form"];

    static values = {
        likesCount: Number,
        isLiked: Boolean,
        likeText: String,
        dislikeText: String,
        thumbUp: String,
        thumbUpHollow: String,
        likeUrl: String,
        dislikeUrl: String,
    };

    like() {
        this.buttonTextTarget.textContent = this.dislikeTextValue;
        if (this.likesCountValue == 0) {
            this.likersTarget.classList.remove("hidden");
            this.iconTarget.classList.add("hidden");
        }
        this.iconLikersTarget.style = this.thumbUpValue;
        this.counterTarget.innerHTML = this.likesCountValue + 1;
        this.likesCountValue += 1;
        setTimeout(() => {
            this.formTarget.setAttribute("action", this.dislikeUrlValue);
        }, 300);
    }

    dislike() {
        this.buttonTextTarget.textContent = this.likeTextValue;
        if (this.likesCountValue == 1) {
            this.likersTarget.classList.add("hidden");
            this.iconTarget.classList.remove("hidden");
        } else {
            this.iconLikersTarget.style = this.thumbUpHollowValue;
        }
        this.counterTarget.innerHTML = this.likesCountValue - 1;
        this.likesCountValue -= 1;
        setTimeout(() => {
            this.formTarget.setAttribute("action", this.likeUrlValue);
        }, 300);
    }

    handleClick(event) {
        if (this.isLikedValue) {
            this.dislike();
            this.isLikedValue = false;
        } else {
            this.like();
            this.isLikedValue = true;
        }
    }
}
