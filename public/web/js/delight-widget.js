Delight = {
  templateName: 'product',
  addedToCart: false,
  apiUrl: 'https://api-dev.delightglobal.io',
  appUrl: 'https://cdn.jsdelivr.net/gh/Dev-Demons/custom-greenman@main/public'
  // appUrl: 'https://delight-custom-greenman-dev.fly.dev'
}

const delightHostPartnerId = "64116ad7a5b7f032f200605a"
const delightApiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbHBkZXNrQGdyZWVubWFuZ2FtaW5nLmNvbSIsImlkIjoiNjQxMTZhZDdhNWI3ZjAzMmYyMDA2MDVhIiwiaWF0IjoxNjc4ODYzMDYzLCJleHAiOjE5OTQ0MzkwNjN9.7kzhs6186pCUtvMKzRwnXc9DC1GzrZeEe6m319JG6GY"

if (window.location.href.includes("your-cart---order") == true) {
  Delight.templateName = 'cart'
} else {
  Delight.templateName = 'product'
}

let campaign = {}
let rewardProducts = []
// it is used to preventing double adding
let isRewardAdded = false;

{/* <section class="your-cart-section"></section> */}
//on the "your-cart---order" page
const cartFormSelectors = [
  "section.your-cart-section"
]
// const cartFormSelectors = [
//   ".cart-content"
// ]
// const cartFormSelectors = [
//   ".basket-table"
// ]
const closeCartItemSelectors = [
  "tr",
]

const cartThumbnailSelectors = [
  ".product-image-link",
]

const cartQuantitySelectors = [
  ".prod-quantity",
]

const cartQtyInputSelectors = [
  ".quantity-selector",
]

const formSelectors = [
  "#top-content-text",
]

const addToCartSelectors = [
  "data-add-to-basket",
]

const addToCartContainerSelectors = [
  ".btn-container-add-to-basket"
]

const prodQuantitySelectors1 = [
  ".col-xs-7", ".prod-quantity"
]

const prodQuantitySelectors2 = [
  ".col-xs-2", ".prod-quantity"
]

const prodPriceSelectors = [
  ".col-sm-3", ".col-md-3", ".hidden-xs", ".text-right", ".prices"
]

const prodRemoveItemSelectors = [
  ".col-xs-2", ".remove-container"
]

const paymentSelectors = [
  "#checkoutBtn"
]

//add delight-widget
const delightCartWidget = document.createElement("delight-cart-widget")
delightCartWidget.innerText = "delight-cart-widget"
delightCartWidget.className = "delight__widget-container visually-hidden"
document.querySelector('body').appendChild(delightCartWidget)

// add css file
function addCss() {
  var cssId = 'delight-widget-css';  // you could encode the css path itself to generate id..
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${Delight.appUrl}/web/css/delight-widget.css`;
    link.media = 'all';
    head.appendChild(link);
  }
}
addCss()

if (typeof window.debounce === "undefined") {
  window.debounce = function (fn, wait) {
    let t
    return (...args) => {
      clearTimeout(t)
      t = setTimeout(() => fn.apply(this, args), wait)
    }
  }
}

if (typeof window.fetchConfig === "undefined") {
  window.fetchConfig = (type = "json") => {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/${type}`
      }
    }
  }
}

function hideButton(button) {
  button.setAttribute(
    "style",
    "display:none!important;visibility:hidden;position:absolute;left:-10000px;"
  )
}

function clickHiddenButton(button) {
  window.btButtonState = "pass-through"
  if (window.$ && window.hulkapps && window.hulkapps.is_product_option) {
    logInfo("Hulkapps Product Options found. Clicking using jQuery.")
    try {
      window.$(button).trigger("click")
    } catch (error) {
      logError("jQuery click failed. Falling back to .click()", error)
      button.click()
    }
  } else {
    button.click()
  }
}

function filterCheckoutForms(button) {
  try {
    const form = button.closest("form")
    if (form && form.attributes && form.attributes.action) {
      return form.attributes.action.value !== "/checkout"
    }
    return true
  } catch (error) {
    console.log("filterCheckoutForms", error)
    return true
  }
}


class ButtonsBase {
  buttonPairs = []

  constructor(eventName) {
    this.eventName = eventName
  }

  watchButtonRemoval(targetNode) {
    let target = targetNode
    function findInsertedButton(addedNodes, hiddenButton) {
      return Array.from(addedNodes).find(
        (n) =>
          n.nodeName === hiddenButton.nodeName && n.type === hiddenButton.type
      )
    }

    const callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          for (var node of mutation.removedNodes) {
            if (node === target) {
              console.log(
                `${node.tagName}#${node.id} is being removed. Updating reference.`
              )
              const buttonPair = this.getPairByHiddenButton(target)
              buttonPair.hiddenButton = findInsertedButton(
                mutationsList.flatMap((e) => Array.from(e.addedNodes)),
                buttonPair.hiddenButton
              )
              target = buttonPair.hiddenButton
              hideButton(target)

              buttonPair.clonedButton.disabled =
                buttonPair.hiddenButton.disabled
              buttonPair.clonedButton.className =
                buttonPair.hiddenButton.className
              buttonPair.clonedButton.innerHTML =
                buttonPair.hiddenButton.innerHTML
            }
          }
        }
      }
    }

    try {
      const observer = new MutationObserver(callback)

      observer.observe(targetNode.parentElement, { childList: true })
    } catch (error) {
      console.log("Failed to setup button removal observer", error)
    }
  }

  watchButtonChanges(targetNode) {
    const callback = () => {
      console.log(`${targetNode.id} is being modified. Updating content.`)
      const { clonedButton, hiddenButton } =
        this.getPairByHiddenButton(targetNode)
      if (hiddenButton.style.display !== "none") {
        hideButton(hiddenButton)
      }
      clonedButton.disabled = hiddenButton.disabled
      clonedButton.className = hiddenButton.className
      clonedButton.innerHTML = hiddenButton.innerHTML
      clonedButton.value = hiddenButton.value

      const eventName = "productVariantIdChanged"

      console.log(`Firing ${eventName}`)
      document.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { clonedButton, hiddenButton }
        })
      )
    }

    try {
      const observer = new MutationObserver(debounce(callback, 300))

      observer.observe(targetNode, {
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ["disabled", "className", "style", "value"]
      })
    } catch (error) {
      console.log("Failed to setup button changes observer", error)
    }
  }

  cloneButtons() {
    const buttons = this.getButtons()
    console.log(`found ${buttons.length} buttons`)

    buttons.forEach((button) => {
      button.classList.add("delight")
      const cloned = button.cloneNode(true)
      cloned.classList.add("delight-cloned")
      button.insertAdjacentElement("afterend", cloned)
      hideButton(button)
      this.watchButtonRemoval(button)
      this.watchButtonChanges(button)

      this.buttonPairs.push({
        clonedButton: cloned,
        hiddenButton: button
      })
    })

    const buttonClicked = (event) => {
      const target = event.currentTarget || event.target
      const pair = this.getPairByClonedButton(target)
      if (!pair) {
        console.log("Couldn't find pair for cloned button.", target)
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()

      document.dispatchEvent(new CustomEvent(this.eventName, { detail: pair }))
    }

    this.buttonPairs.forEach(({ clonedButton }) => {
      clonedButton.addEventListener("click", buttonClicked, { capture: true })
    })
    return this.buttonPairs
  }

  getPairByHiddenButton(button) {
    return this.buttonPairs.find((pair) => pair.hiddenButton === button)
  }

  getPairByClonedButton(clonedButton) {
    return this.buttonPairs.find((pair) => pair.clonedButton === clonedButton)
  }
}

class Buttons extends ButtonsBase {
  constructor(eventName) {
    super(eventName)

    this.cloneButtons()
    this.buttonWatcher()
    this.debouncedCloneButtons = debounce(this.cloneButtons.bind(this), 1000)
    window.btCloneButtons = this.debouncedCloneButtons
  }

  getButtons() {
    let combinedButtons = Array.from(
      document.querySelectorAll(addToCartSelectors)
    )

    return Array.from(new Set(combinedButtons))
      .filter(filterCheckoutForms)
      .filter(
        (element) =>
          !this.buttonPairs.find(
            (pair) =>
              pair.hiddenButton === element || pair.clonedButton === element
          )
      )
  }

  buttonWatcher() {
    try {
      const observer = new MutationObserver(() => {
        this.debouncedCloneButtons()
      })
      const targetNode = document.body
      observer.observe(targetNode, { childList: true })
    } catch (error) {
      console.log("Failed to setup ATC observer", error)
    }
  }
}

// check if product is reward
function isRewardProduct(identity) {
  let rLen = 0
  rLen = rewardProducts.length
  for (let i = 0; i < rLen; i++) {
    let cLen = rewardProducts[i].customInfos?.length
    if (rewardProducts[i].customInfos && cLen > 0) {
      for (let j = 0; j < cLen; j++) {
        if (rewardProducts[i].customInfos[j].data?.catalogId && rewardProducts[i].customInfos[j].data?.catalogId == identity) return true
      }
    }
  }
  return false
}

//Get rewards with catalogId and pageurl
function getRewardProducts(rewards) {
  let arr = []
  if (!rewards) return arr

  rewards.map((reward) => {
    if (!reward.customInfos) return
    let isInfo = false
    let idx = 0
    for (idx = 0; idx < reward.customInfos.length; idx++) {
      if (reward.customInfos[idx].hostPartner.id == delightHostPartnerId) {
        isInfo = true;
        break;
      }
    }
    if (isInfo) {
      reward.catalogId = reward.customInfos[idx].data.catalogId
      reward.pageurl = reward.customInfos[idx].data.pageurl
      arr.push(reward)
    }
  })
  return arr
}

// The global variable to store the reward and product count in the cart
let rewardCnt = 0;
let productCnt = 0;

// count for rewards and products in cart
function getSelRewardCnt() {
  let itemCount = 0
  rewardCnt = 0
  productCnt = 0
  if(Delight.templateName === "product") {
    const cartElement = document.querySelector('.cart-content')
    itemCount = cartElement?.querySelectorAll('li').length
    if(!cartElement) return
    rewardProducts.forEach((reward) => {
      const tdVariantElements = cartElement?.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )
      if (tdVariantElements?.length > 0) {
        rewardCnt++;
      }
    })
    if(itemCount < rewardCnt) return
    productCnt = itemCount - rewardCnt

  } else if (Delight.templateName === "cart") {
    const basketContainerElement = document.querySelector('.delight-basket-table')
    const basketTableElement = basketContainerElement?.querySelector('ul.table-cart')
    if(!basketTableElement) return
    itemCount = basketTableElement.querySelectorAll('li').length
    rewardProducts.forEach((reward) => {
      const tdVariantElements = document.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )
      if (tdVariantElements?.length > 0) {
        rewardCnt++;
      } else {
        const delightWidgetElement = document.querySelector(
          `#product-form-${reward.pageurl}`
        )
        if(delightWidgetElement) {
          const submitButton = delightWidgetElement.querySelector('.product-form__submit.button')
          if(submitButton) {
            submitButton.setAttribute("disabled", false)
          }
        }
      }
    })
    if(itemCount < rewardCnt) return
    productCnt = itemCount - rewardCnt
  }
}

function isRewardInCart(reward) {
  console.log("isRewardInCart  ", reward.pageurl)
  const cartElement = document.querySelector('.cart-content')
  const tdVariantElements = cartElement?.querySelectorAll(
    `a[href*="${reward.pageurl}"]`
  )

  if (tdVariantElements?.length > 0) {
    for(let idx=0; idx<tdVariantElements.length; idx++) {
      const imageElement = tdVariantElements[idx].querySelector('.prod-image')
      const nameElement = tdVariantElements[idx].querySelector('.prod-name')
      const quantityElement = tdVariantElements[idx].querySelector('prod-quantity')
      if(imageElement && nameElement && quantityElement) {
        console.log("is reward in cart true")
        return true
      } else {
        console.log("is reward in cart false")
        return false
      }
    }
  }
  console.log("is reward in cart false")
  return false
}

// show free gift mark on the "cart-container" of the cart dropdown
function showFreeIllustartion() {
  if (campaign?.showGiftLabel && Delight.templateName === "product") {
    // rewardProducts.forEach((reward) => {

    //   const rewardElements = document.querySelectorAll(
    //     `a[href*="${reward.pageurl}"]`
    //   )
    //   if (rewardElements?.length > 0) {

    //     rewardElements.forEach((rewardElement) => {
    //       const trThumbnailInput = rewardElement.querySelector(
    //         ".css-ellipsis"
    //       )

    //       if (!trThumbnailInput) return;
    //       if (trThumbnailInput.querySelector('.delight__gift--label___delight-wrapper')) return;

    //       const prodNameElement = trThumbnailInput.parentNode
    //       const giftLabel = document.createElement("div")
    //       trThumbnailInput.classList.remove('css-ellipsis')
    //       giftLabel.classList.add('delight__gift--label___delight-wrapper')
    //       giftLabel.innerHTML = `
    //         <div class="delight__gift--label___delight" style="margin-top:5px">
    //           <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)" width="15" height="15">
    //           <span>Free Gift</span>
    //         </div>`
    //         prodNameElement.appendChild(giftLabel)
    //     })
    //   }
    // })
  }
}

//Show the Banner Illustrations on the "<cart page>"
function showBannerIllustartion() {
  if (campaign?.showRewardBanner && Delight.templateName === "cart") {
    const oldBanner = document.querySelector('#delight_banner_unique_id')
    if (oldBanner) oldBanner.remove();

    let rewardCnt = 0;

    rewardProducts.forEach((reward) => {
      const tdVariantElements = document.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )

      if (tdVariantElements?.length > 0) {
        rewardCnt++;
      }
    })

    let cartFormElement = document.querySelector(cartFormSelectors)
    if (!cartFormElement) return;

    const cartFormElementParent = cartFormElement.parentNode
    const newBanner = document.createElement("div");
    newBanner.id = 'delight_banner_unique_id';
    const strBanner = `
        <div class="outter">
          <div class="inner">
            <img src="${Delight.appUrl}/web/images/icon-check.svg" width="20" height="20">
            <span>You have qualified for ${rewardCnt} free gift(s)</span>
          </div>
        </div>`
    newBanner.innerHTML = strBanner;
    cartFormElementParent.insertBefore(newBanner, cartFormElement.nextSibling);
  }
}

//Hide the quantity of the Reward in the <"cart dropdown" of product page> and <"cart page">
function hideRewardQuantity() {
  console.log("hide quantity")
  rewardProducts.forEach((reward) => {
    const tdVariantElements = document.querySelectorAll(
      `a[href*="${reward.pageurl}"]`
    )
    if (tdVariantElements?.length > 0) {
      tdVariantElements.forEach((tdVariantElement) => {
        if (Delight.templateName === "product") {
          const trQuantityInputs = tdVariantElement.querySelectorAll(
            ".prod-quantity"
          )
          if (!trQuantityInputs) return;
          for (let idx = 0; idx < trQuantityInputs.length; idx++) {
            const giftLabel = document.createElement("div")
            giftLabel.classList.add('delight__gift--label___delight-wrapper')
            giftLabel.innerHTML = `
              <div class="delight__gift--label___delight-cart">
                <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)" width="15" height="15">
                <span style="margin-top:5px">Free Gift</span>
              </div>`
            trQuantityInputs[idx].innerHTML = ""
            trQuantityInputs[idx].classList?.add('delight__gift--label___padding-top')
            trQuantityInputs[idx].appendChild(giftLabel)
            // trQuantityInputs[idx].classList?.add("delight__widget-quantity-disabled")
          }
        } else if (Delight.templateName === "cart") {
          let trQuantityInputs = tdVariantElement.querySelector(
            ".info-int"
          )
          if (!trQuantityInputs) return;
          if (trQuantityInputs.querySelector('.delight__gift--label___delight-wrapper')) return;

          let customElement1 = trQuantityInputs?.querySelector("platform-names")
          let customElement2 = trQuantityInputs?.querySelector(".prod-drm")
          if(customElement1) {
            trQuantityInputs.removeChild(customElement1)
          }
          if(customElement2) {
            trQuantityInputs.removeChild(customElement2)
          }

          const giftLabel = document.createElement("div")
          giftLabel.classList.add('delight__gift--label___delight-wrapper')
          giftLabel.innerHTML = `
            <div class="delight__gift--label___delight" style="margin-top:5px">
              <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)" width="15" height="15">
              <span>Free Gift</span>
            </div>`
          trQuantityInputs.appendChild(giftLabel)

          const parentElement = tdVariantElement?.parentNode
          if(!parentElement) return;
          const gparentElement = parentElement.parentNode
          if(!gparentElement) return;

          let prodQuantityElement1 = gparentElement?.querySelector(
            prodQuantitySelectors1.join("")
          )
          if(prodQuantityElement1) {
            prodQuantityElement1.classList.add("delight__widget-quantity-disabled")
          }

          let prodQuantityElement2 = gparentElement?.querySelector(
            prodQuantitySelectors2.join("")
          )
          console.log(prodQuantityElement2)
          if(prodQuantityElement2) {
            const customElement = document.createElement("div")
            customElement.classList.add("delight__widget-quantity-disabled")
            const preChildElements = prodQuantityElement2.children
            for (let cidx = 0; cidx < preChildElements.length; cidx++) {
              customElement.appendChild(preChildElements[cidx])
            }
            prodQuantityElement2.innerHTML = ""
            prodQuantityElement2.appendChild(customElement)
          }

          let prodPriceElement = gparentElement.querySelector(
            prodPriceSelectors.join("")
          )
          if(prodPriceElement) {
            const customElement = document.createElement("div")
            customElement.classList.add("delight__widget-quantity-disabled")
            const preChildElements = prodPriceElement.children
            for (let cidx = 0; cidx < preChildElements.length; cidx++) {
              customElement.appendChild(preChildElements[cidx])
            }
            prodPriceElement.innerHTML = ""
            prodPriceElement.appendChild(customElement)
          }
        }
      })
    }
  })
}

// if no normal products in cart, remove all rewards
function removeRewards() {
  if(productCnt == 0) {
    if(Delight.templateName === "product") {
      const cartElement = document.querySelector('.cart-content')
      const removeContainerElements = cartElement?.querySelectorAll('.remove-container')
      for(let idx = 0; idx < removeContainerElements?.length; idx++) {
        const removeContainerElement = removeContainerElements[idx]
        const removeElement = removeContainerElement.querySelector('a')
        if(removeElement) {
          removeElement.click()
        }
      }
    } else if (Delight.templateName === 'cart') {
      const basketContainerElement = document.querySelector('.delight-basket-table')
      const basketTableElement = basketContainerElement?.querySelector('ul.table-cart')
      if(!basketTableElement) return
      const trashElements = basketTableElement.querySelectorAll('.remove-container.hidden-xs')
      for(let idx=0; idx<trashElements.length; idx++) {
        const removeContainerElement = trashElements[idx]
        const removeElement = removeContainerElement.querySelector('a')
        if(removeElement) {
          removeElement.click()
        }
      }
    }
    productCnt = 0
    rewardCnt = 0
  }
}

// Automatically Remove rewards that the user once remove from the cart
function removeDislikeRewards() {
  if (Delight.templateName === 'cart') {
    const storedValue = window.localStorage.getItem('Dislikes')
    let dislikeArray = []
    if(storedValue != null) {
      dislikeArray = JSON.parse(storedValue)
    }
    const cartElement1 = document.querySelector('.cart-content')
    rewardProducts.forEach((reward) => {
      if(dislikeArray.contains(reward.pageurl)) {
        const tdVariantElement = cartElement1?.querySelector(
          `a[href*="${reward.pageurl}"]`
        )

        if(!tdVariantElement) return
        const cartElement = tdVariantElement.parentNode
        if(!cartElement) return
        const removeContainerElements = cartElement?.querySelectorAll('.remove-container')
        for(let idx = 0; idx < removeContainerElements.length; idx++) {
          const removeContainerElement = removeContainerElements[idx]
          const removeElement = removeContainerElement.querySelector('a')
          if(removeElement) {
            removeElement.click()
          }
        }
      }
    })
  }
}

isAddBtnEnabled = false
function updateQuantity() {
  let m = 0;
  let stateCheck = setInterval(async () => {
    getSelRewardCnt()
    removeRewards()
    removeDislikeRewards()
    showBannerIllustartion()
    // showFreeIllustartion()
    hideRewardQuantity()

    //check if add cart delight button inactive
    if(window.location.href.includes("products") == true  && !isAddBtnEnabled) {
      if (document.querySelector('button.delight-cloned')?.classList?.contains("button-inactive") == false) {
        isAddBtnEnabled = true
      } else {
        if (!document.querySelector('button.delight')?.classList?.contains("button-inactive") && document.querySelector('button.delight-cloned')?.classList?.contains("button-inactive")) {
          document.querySelector('button.delight-cloned')?.classList?.remove('button-inactive')
          isAddBtnEnabled = true
        }
      }
    }

    if (m === 10) {
      clearInterval(stateCheck);
    }
    m++;
  }, 500);
}

const debouncedOnChange = debounce(() => {
  updateQuantity()
}, 1000)

document.addEventListener(
  "click",
  debouncedOnChange.bind(this)
)


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function setDelightWidgetDetail() {
  if (!customElements.get("delight-product-detail-modal")) {
    customElements.define(
      "delight-product-detail-modal",
      class DelightProductDetailModal extends HTMLElement {
        constructor() {
          super()
          this.querySelector(
            '[id^="DelightProductDetailModalClose-"]'
          ).addEventListener("click", this.hide.bind(this, false))

          this.addEventListener("keyup", (event) => {
            if (event.code.toUpperCase() === "ESCAPE") this.hide()
          })

          this.querySelectorAll(
            ".delight__widget-modal--content-toggle-btn"
          ).forEach((btn) =>
            btn.addEventListener("click", this.toggleContent.bind(this))
          )

          if (this.classList.contains("media-modal")) {
            this.addEventListener("pointerup", (event) => {
              if (
                event.pointerType === "mouse" &&
                !event.target.closest("deferred-media, product-model")
              )
                this.hide()
            })
          } else {
            this.addEventListener("click", (event) => {
              if (event.target === this) this.hide()
            })
          }
        }

        connectedCallback() {
          if (this.moved) return
          this.moved = true
          document.body.appendChild(this)
        }

        show(opener) {
          this.openedBy = opener
          document.body.classList.add("overflow-hidden")
          this.setAttribute("open", "")
        }

        hide() {
          document.body.classList.remove("overflow-hidden")
          document.body.dispatchEvent(new CustomEvent("modalClosed"))
          this.removeAttribute("open")
        }

        toggleContent(event) {
          const parentElement = event.target.closest(
            ".delight__widget-modal--content-details"
          )
          const content = parentElement.querySelector(
            ".delight__widget-modal--content-details-wrapper"
          )
          if (parentElement.classList.contains("collapsed")) {
            content.style.height = content.scrollHeight + "px"
          } else {
            content.style.height = 0
          }
          parentElement.classList.toggle("collapsed")
        }
      }
    )
  }

  if (!customElements.get("delight-modal-opener")) {
    customElements.define(
      "delight-modal-opener",
      class DelightModalOpener extends HTMLElement {
        constructor() {
          super()

          const button = this.querySelector("button")
          if (!button) return

          button.addEventListener("click", () => {
            const modal = document.querySelector(this.getAttribute("data-modal"))
            if (modal) {
              modal.show(button)
            }
          })
        }
      }
    )
  }

  if (!customElements.get("delight-product-form")) {
    customElements.define(
      "delight-product-form",
      class DelightProductForm extends HTMLElement {
        constructor() {
          super()

          this.form = this.querySelector("form")
          this.form.addEventListener("submit", this.onSubmitHandler.bind(this))
          this.submitButton = this.querySelector('[type="submit"]')
        }

        async onSubmitHandler(evt) {
          evt.preventDefault()
          if (this.submitButton.getAttribute("disabled") === "true") return

          this.handleErrorMessage()

          this.submitButton.setAttribute("disabled", true)
          this.submitButton.classList.add("loading")
          this.querySelector(".loading-overlay__spinner").classList.remove(
            "hidden"
          )

          let catalogId = this.form.querySelector('[name=catalogId]').value
          console.log(reward.pageurl)
          const tdVariantElements = document.querySelectorAll(
            `a[href*="${reward.pageurl}"]`
          )
          if (tdVariantElements?.length > 0) return
          console.log(reward.pageurl)

          //add to basket
          const res = await fetch(
            `https://api.greenmangaming.com/api/v2/cart/add_to_basket/`,
            {
              method: "POST",
              credentials: 'include',
              headers: {
                'Content-Type': "application/json"
              },
              body: JSON.stringify({
                "catalogId": catalogId
              })
            }
          )
          window.location.reload()
        }

        handleErrorMessage(errorMessage = false) {
          console.log(errorMessage)
        }
      }
    )
  }
}

let gHostName = "Delight"
if (!customElements.get("delight-widget")) {
  async function init() {
    // Get campaign
    const res = await fetch(
      `${Delight.apiUrl}/campaigns/connect/${delightHostPartnerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${delightApiToken}`,
          "Content-Type": "application/json",
        }
      }
    )

    if (!res.ok) return
    const result = await res.json()

    const { campaigns } = result
    if (!campaigns || campaigns.length == 0) return

    campaign = campaigns[0]
    rewardProducts = getRewardProducts(campaign.rewards)

    const {
      headline,
      description,
      showWidgetAtCartPage,
      showWidgetAtProductPage,
      status,
      hostPartner
    } = campaign

    gHostName = hostPartner.brandPartner?.split(" ")[0]
    if (!gHostName) gHostName = "Delight"

    // remove add button on reward product page
    // removeAddButtonProductPage()

    if (status !== "active") return

    customElements.define(
      "delight-cart-widget",
      class DelightCartWidget extends HTMLElement {
        constructor() {
          super()

          if (showWidgetAtCartPage && Delight.templateName === "cart") {
            this.classList.remove("visually-hidden")

            let headHtml = `
              <div class="delight__widget-head">
                <div class="delight__widget-head-content">
                    <div class="delight__widget-title">
                        <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)">
                        <h4 class="delight__widget-headline">${headline}</h4>
                    </div>
                    <p class="delight__widget-description">${description}</p>
                </div>
                  <div class="delight__widget-content-arrow-wrapper">
                      <span id="delight__widget-content-btn" class="delight__widget-content-btn cursor-pointer">
                          <img
                              src="${Delight.appUrl}/web/images/icon-cheveron-up.svg" style="filter:invert(1)">
                      </span>
                  </div>
              </div>`
            getSelRewardCnt()
            let selCount = rewardCnt
            let totalCount = rewardProducts.length

            let bodyHtml = `
              <div class="delight__widget-body">
              <div class="delight__widget-qualified-message">
                  Qualified<img
                      src="${Delight.appUrl}/web/images/icon-delight-qualified.svg">(over
                  $0.01 cost spent)
              </div>
              <small
                  class="delight__widget-qualified-small-message">
                  <strong>${selCount}/${totalCount}</strong>
                  free gifts selected</small>
              <ul id="delight__widget-content" class="delight__widget-main-items">`


            let liHtml = ''
            rewardProducts.forEach((reward) => {
              let disabled = ''
              if (isRewardInCart(reward)) disabled = 'disabled'
              liHtml += `
                <li class="delight__widget-item">
                  <div class="delight__widget-item-desc">
                      <img src="${reward.images[0]?.url}" alt="2 FREE gifts on ALL orders" loading="lazy" width="70"
                          height="70" class="delight__widget-item-image">
                      <div class="delight__widget-item-content">
                          <div class="cart-item__name h4 break">${reward.headline}</div>
                          <div class="delight__gift--label___delight">
                            <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)">
                            <span>Free gift from ${gHostName}</span>
                          </div>
                      </div>
                  </div>

                  <div class="delight__widget-actions">
                      <delight-product-form>
                          <form method="post" action="" id="product-form-${reward.pageurl}"
                              accept-charset="UTF-8"
                              class="form" enctype="multipart/form-data" novalidate="novalidate"
                              data-type="add-to-cart-form">
                              <input type="hidden" name="catalogId" value="${reward.catalogId}">
                              <div class="product-form__buttons">
                                  <button type="submit" name="add" class="product-form__submit button" ${disabled}>
                                      <img
                                          src="${Delight.appUrl}/web/images/icon-delight-add-bag.svg">
                                      <div class="loading-overlay__spinner hidden">
                                          <svg aria-hidden="true" focusable="false" role="presentation"
                                              class="delight-spinner"
                                              viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                              <circle class="path" stroke-width="6" cx="33" cy="33" r="30"></circle>
                                          </svg>
                                      </div>
                                  </button>
                              </div>
                          </form>
                      </delight-product-form>

                      <delight-product-detail-modal id="DelightProductDetailModal-${reward.sku}">
                          <div class="delight__widget-modal" role="dialog" tabindex="-1"
                              aria-label="${reward.headline}" aria-modal="true">
                              <div class="delight__widget-modal-content">
                                  <span id="DelightProductDetailModalClose-${reward.sku}"
                                      class="delight__widget-close-button">×</span>
                                  <div class="delight__widget-modal--image-wraper">
                                      <img src="${reward.images[0]?.url}"
                                          alt="" loading="lazy" width="500"
                                          height="500"
                                          class="delight__widget-modal--image">
                                  </div>
                                  <div class="delight__widget-modal--content-wrapper">
                                      <h2 class="delight__widget-modal--content-heading">Product Details</h2>
                                      <h3 class="delight__widget-modal--content-headline">${reward.headline}></h3>
                                      <div class="delight__widget-modal--content-details">
                                          <h4>
                                              <span>Product Overview</span>
                                              <span class="delight__widget-modal--content-toggle-btn">
                                                  <img src="${Delight.appUrl}/web/images/icon-cheveron-up.svg">
                                              </span>
                                          </h4>
                                          <div class="delight__widget-modal--content-details-wrapper">
                                              ${reward.description}
                                          </div>
                                      </div>
                                      <div class="delight__widget-modal--content-details">
                                          <h4>
                                              <span>Terms and Policy</span>
                                              <span class="delight__widget-modal--content-toggle-btn">
                                                  <img src="${Delight.appUrl}/web/images/icon-cheveron-up.svg">
                                              </span>
                                          </h4>
                                          <div class="delight__widget-modal--content-details-wrapper">
                                              ${reward.terms}
                                              <a class="text-link" href="${reward.url}"
                                                  target="_blank">Learn more</a>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </delight-product-detail-modal>
                      <delight-modal-opener data-modal="#DelightProductDetailModal-${reward.sku}">
                          <button id="delight__widget-info-btn-${reward.sku}" aria-haspopup="dialog">
                              <img src="${Delight.appUrl}/web/images/icon-delight-info.svg">
                              <div class="loading-overlay__spinner hidden">
                                  <svg aria-hidden="true" focusable="false"
                                      role="presentation" class="delight-spinner"
                                      viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                      <circle class="path"
                                          fill="none" stroke-width="6"
                                          cx="33" cy="33" r="30"></circle>
                                  </svg>
                              </div>
                          </button>
                      </delight-modal-opener>
                  </div>
                </li>
              `
            })

            bodyHtml += liHtml + '</ul></div>'

            this.innerHTML = headHtml + bodyHtml
            const cartFormElement = document.querySelector(
              cartFormSelectors.join(",")
            )

            const cartFormElementParent = cartFormElement?.parentNode

            const widgetContainer = document.createElement("div")

            cartFormElementParent.insertBefore(widgetContainer, cartFormElement.previousSibling)
            cartFormElement.classList.add('delight-basket-table')
            widgetContainer.appendChild(cartFormElement)
            widgetContainer.appendChild(this)

            setDelightWidgetDetail()

          }
          //  else if (
          //   showWidgetAtProductPage &&
          //   Delight.templateName === "product"
          // ) {
          //   new Buttons("addToCartButtonClicked")
          // }

          // delete all items if the cart price is zero in minicart in Lucky Saint
          updateQuantity()
        }

        connectedCallback() {
          if (showWidgetAtCartPage && Delight.templateName === "cart") {
            this.contentBtn = document.getElementById(
              "delight__widget-content-btn"
            )
            this.contentBtn.addEventListener("click", this.toggleContent)
          } else if (
            Delight.templateName === "product"
          ) {
            // Handle the button click when the "Add to Cart" button is clicked
            if(showWidgetAtProductPage) {
              const addButtonContainerElements = document.querySelectorAll(addToCartContainerSelectors.join(","))
              addButtonContainerElements?.forEach((addButtonContainerElement) => {
                const addButtonElement = addButtonContainerElement.querySelector('button')
                if(addButtonElement) {
                  addButtonElement.addEventListener("click",this.handleExternalAddToCartButtonClick, { capture: true })
                }
              })
            }

            // Handle the button click when the "RemoveItem" button is clicked in the cart dropdown of the product page
            const removeButtonContainerElements = document.querySelectorAll(prodRemoveItemSelectors.join(""))
            removeButtonContainerElements?.forEach((removeButtonContainerElement) => {
              const removeButtonElement = removeButtonContainerElement.querySelector('a')
              if(removeButtonElement) {
                removeButtonElement.addEventListener("click",this.handleExternalRemoveFromCartButtonClick, { capture: true })
              }
            })
          }
        }

        disconnectedCallback() {
          if (showWidgetAtCartPage && Delight.templateName === "cart") {
            this.contentBtn.removeEventListener("click", this.toggleContent)
          }
        }

        toggleContent() {
          const content = document.getElementById("delight__widget-content")
          if (this.classList.contains("collapsed")) {
            content.style.height = content.scrollHeight + "px"
          } else {
            content.style.height = 0
          }
          this.classList.toggle("collapsed")
        }

        // Handler of "Add Reward to Cart" when "Add to cart" button of product page is clicked
        async handleExternalAddToCartButtonClick(event) {
          event.preventDefault()
          if (rewardCnt < rewardProducts.length) {
            const apiResponsePromises = [];
              rewardProducts.forEach(async (reward) => {
                if (isRewardInCart(reward)) {
                  return
                }
                const apiResponsePromise = fetch(
                  `https://api.greenmangaming.com/api/v2/cart/add_to_basket/`,
                  {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                      'Content-Type': "application/json"
                    },
                    body: JSON.stringify({
                      "catalogId": reward.catalogId
                    })
                  }
                  )
                apiResponsePromises.push(apiResponsePromise);
              })
              const apiResponses = await Promise.all(apiResponsePromises);
              apiResponses.forEach(apiResponse => {
                if (apiResponse.ok) {
                  window.delightProductAdded = true
                } else {
                  window.delightProductAdded = false
                }
              })
              setTimeout(()=>{
                event.target.dispatchEvent(new Event('click'));
              }, 500)
          }
        }

        // Handler of "Remove Rewards from cart" when the "remove" button of product page is clicked
        async handleExternalRemoveFromCartButtonClick(event) {
          event.preventDefault()

          const storedValue = window.localStorage.getItem('Dislikes')
          let dislikeArray = []
          if(storedValue != null) {
            dislikeArray = JSON.parse(storedValue)
          }

          const parentElement = event.target.parentNode
          if(!parentElement) return
          const gparentElement = parentElement.parentNode
          if(!gparentElement) return

          const hrefValue = gparentElement.querySelector('a').href
          if(dislikeArray.contains(hrefValue)) return
          rewardProducts.forEach(async (reward) => {
            if(hrefValue == reward.pageurl) {
              dislikeArray.push(hrefValue)
              window.localStorage.setItem('Dislikes', JSON.stringify(dislikeArray))
              return
            }
          })

          event.target.dispatchEvent(new Event('click'));
        }

      }
    )
  }

  init()
}
