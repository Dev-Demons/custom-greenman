window.Delight = {
	pageName: "thank_you",
	orderId: document.querySelector('#FSI_IFrame')?.dataset?.feefoOrderref,
	userName: document.querySelector('#FSI_IFrame')?.dataset?.feefoName,
	contactEmail: document.querySelector('#FSI_IFrame')?.dataset?.feefoEmail,
	products: document.querySelector('#FSI_IFrame')?.dataset?.feefoProducts ? JSON.parse(document.querySelector('#FSI_IFrame')?.dataset?.feefoProducts): [],
	apiUrl: 'https://api-dev.delightglobal.io',
	appUrl:'https://cdn.jsdelivr.net/gh/Dev-Demons/custom-greenman@main/public'
	// appUrl:'https://delight-custom-greenman-dev.fly.dev'
}

var rewards = []
var popup = {}

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

const delightHostPartnerId = "64116ad7a5b7f032f200605a"
const delightApiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbHBkZXNrQGdyZWVubWFuZ2FtaW5nLmNvbSIsImlkIjoiNjQxMTZhZDdhNWI3ZjAzMmYyMDA2MDVhIiwiaWF0IjoxNjc4ODYzMDYzLCJleHAiOjE5OTQ0MzkwNjN9.7kzhs6186pCUtvMKzRwnXc9DC1GzrZeEe6m319JG6GY"

async function delightPopupInit() {
	let lineItems = []

	Delight.products?.forEach(product => {
		lineItems.push({
			catalogId: product.productsearchcode
		})
		// let arr = product.productsearchcode.split('-')
		// if (arr.length <2) return
		// lineItems.push({
		// 	styleId: arr[1],
		// 	optionId: arr[2]
		// })
	})

	if(!Delight.orderId) return

	const res = await fetch(
		`${Delight.apiUrl}/campaigns/orderPourmoi/${delightHostPartnerId}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${delightApiToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				"orderId": Delight.orderId,
				"customerEmail": Delight.contactEmail,
				"lineItems": lineItems
			})
		}
	)

	if (!res.ok) return
    const result = await res.json()

    const { campaigns, retRewards } = result
	console.log()
    if (!campaigns || campaigns.length == 0 || campaigns[0].status != "active" || !campaigns[0].noticeByPopup)  return
	rewards = retRewards
	popup = campaigns[0].popup
	if (popup.headerContent) {
		if (Delight?.userName?.length > 0) {
			Delight.userName = Delight.userName.replace(Delight.userName[0], Delight.userName[0].toUpperCase())
			Delight.userName = Delight.userName.split(' ')[0]
		}
		popup.headerContent = popup.headerContent.replaceAll('XXX', Delight.userName)
	}
}

var strLoading = `
	<style>
		/* loading */
		.delight__thankyou--loadng.wrap {
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0.2);
			position: fixed;
			top: 0;
			left: 0;
			z-index:100000;
			max-width:100% !important;
		}
		.delight__thankyou--loadng .inner {
			position: fixed;
			top: 50%;
			left: 50%;
			-ms-transform: translateX(-50%) translateY(-50%);
			-webkit-transform: translate(-50%,-50%);
			transform: translate(-50%,-50%);
		}
		.delight__thankyou--loadng .lds-default {
			display: inline-block;
			position: relative;
			width: 80px;
			height: 80px;
		}
		.delight__thankyou--loadng .lds-default div {
			position: absolute;
			width: 6px;
			height: 6px;
			background: #000;
			border-radius: 50%;
			animation: lds-default 1.2s linear infinite;
			display: block !important;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(1) {
			animation-delay: 0s;
			top: 37px;
			left: 66px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(2) {
			animation-delay: -0.1s;
			top: 22px;
			left: 62px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(3) {
			animation-delay: -0.2s;
			top: 11px;
			left: 52px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(4) {
			animation-delay: -0.3s;
			top: 7px;
			left: 37px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(5) {
			animation-delay: -0.4s;
			top: 11px;
			left: 22px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(6) {
			animation-delay: -0.5s;
			top: 22px;
			left: 11px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(7) {
			animation-delay: -0.6s;
			top: 37px;
			left: 7px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(8) {
			animation-delay: -0.7s;
			top: 52px;
			left: 11px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(9) {
			animation-delay: -0.8s;
			top: 62px;
			left: 22px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(10) {
			animation-delay: -0.9s;
			top: 66px;
			left: 37px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(11) {
			animation-delay: -1s;
			top: 62px;
			left: 52px;
		}
		.delight__thankyou--loadng .lds-default div:nth-child(12) {
			animation-delay: -1.1s;
			top: 52px;
			left: 62px;
		}
		@keyframes lds-default {
			0%, 20%, 80%, 100% {
				transform: scale(1);
			}
			50% {
				transform: scale(1.5);
			}
		}
	</style>

	<!-- loading -->
	<div class="delight__thankyou--loadng wrap">
		<div class="inner" >
			<div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
		</div>
	</div>

`

var strModal = ''
function createPopup() {
	var isFlex = "display:none;"
	var strDot = '';
	var strContent = '';

	if (rewards?.length > 1) {
		isFlex = "dislpay:flex;"
	}
	rewards.map((item, index) => {
		let idx = index + 1;
		strDot += `<span class="dot">${idx}</span>`;

		strContent += `
			<div class="popupSlides fade">
				<div class="reward-wraper">
					<img class="reward-img" src="${item.images[0]?.url}" alt="Pineapple" >
					<div class="reward-content">
						<div class="delight--thankyou-detail-wrapper desc">${item.purchasePopupContent}</div>
						<div class="delight--thankyou-detail collapsed">
							<h4>
								<span>Terms and Policy</span>
								<span class="delight__widget-thankyou-modal--content-toggle-btn" onclick="toggleContent(event)">
									<svg
										width="20px"
										height="20px"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
										/>
									</svg>
								</span>
							</h4>
							<div class="delight--thankyou-detail-wrapper term">${item.terms}</div>
						</div>
						<div class="delight--thankyou-detail-voucher-code">
							Voucher Code: &nbsp;&nbsp;&nbsp;${item.voucherCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<div class="voucher-tooltip">
								<span onclick="copyVoucherCode(event,'${item.voucherCode}')" class="voucher-copy-btn">
									<span class="voucher-tooltiptext">copy</span>
									<svg version="1.1" class="voucher-code-copy" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
										width="14px" height="14px" viewBox="0 0 40.945 40.945" style="enable-background:new 0 0 40.945 40.945;"
										xml:space="preserve">
										<g>
												<path d="M35.389,9h-6.166V1.5c0-0.827-0.671-1.5-1.5-1.5H15.454c-0.375,0-0.736,0.142-1.013,0.395L4.543,9.457
														c-0.31,0.285-0.487,0.688-0.487,1.106v19.882c0,0.826,0.671,1.5,1.5,1.5h6.166v7.5c0,0.826,0.671,1.5,1.5,1.5h22.166
														c0.829,0,1.5-0.674,1.5-1.5V10.5C36.889,9.673,36.217,9,35.389,9z M14.318,4.576v5.574H8.229L14.318,4.576z M7.057,28.945V13.15
														h8.761c0.829,0,1.5-0.672,1.5-1.5V3h8.905v6h-3.104c-0.375,0-0.735,0.143-1.013,0.396l-9.897,9.063
														c-0.31,0.283-0.487,0.687-0.487,1.105v9.381H7.057L7.057,28.945z M21.984,13.576v5.572h-6.086L21.984,13.576z M33.889,37.945
														H14.723V22.148h8.762c0.828,0,1.5-0.672,1.5-1.5V12h8.904V37.945z"/>
										</g>
									</svg>
									<svg version="1.1" class="voucher-code-check" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
											width="13px" height="13px" viewBox="0 0 405.272 405.272" style="enable-background:new 0 0 405.272 405.272;"
											xml:space="preserve">
										<g>
												<path d="M393.401,124.425L179.603,338.208c-15.832,15.835-41.514,15.835-57.361,0L11.878,227.836
														c-15.838-15.835-15.838-41.52,0-57.358c15.841-15.841,41.521-15.841,57.355-0.006l81.698,81.699L336.037,67.064
														c15.841-15.841,41.523-15.829,57.358,0C409.23,82.902,409.23,108.578,393.401,124.425z"/>
										</g>
									</svg>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>`;
	})

	strModal = `
		<style>

			/* The Modal (background) */
			.delight__widget-thankyou-modal {
				display: none; /* Hidden by default */
				position: fixed; /* Stay in place */
				z-index: 1000000; /* Sit on top */
				padding-top: 100px; /* Location of the box */
				left: 0;
				top: 0;
				width: 100%; /* Full width */
				height: 100%; /* Full height */
				overflow: auto; /* Enable scroll if needed */
				background-color: rgb(0,0,0); /* Fallback color */
				background-color: rgba(0,0,0,0.2); /* Black w/ opacity */
			}

			.delight__widget-thankyou-modal .display-flex {
				display: flex;
			}

			/* Modal Content */
			.delight__widget-thankyou-modal .modal-content {
				position: relative;
				background-color: #fefefe;
				margin: auto;
				padding: 0;
				border: 1px solid #88888896;
				width: 640px;
				box-shadow: 0 4px 8px 0 rgba(0,0,0,0.06),0 6px 20px 0 rgba(0,0,0,0.10);
				-webkit-animation-name: delight__widget-thankyou-modal-animatetop;
				-webkit-animation-duration: 0.4s;
				animation-name: delight__widget-thankyou-modal-animatetop;
				animation-duration: 0.4s
			}

			/* Add Animation */
			@-webkit-keyframes delight__widget-thankyou-modal-animatetop {
				from {top:-300px; opacity:0}
				to {top:0; opacity:1}
			}

			@keyframes delight__widget-thankyou-modal-animatetop {
				from {top:-300px; opacity:0}
				to {top:0; opacity:1}
			}

			/* The Close Button */
			.delight__widget-thankyou-modal h2
			{
				display: block;
				font-size: 1.5em;
				margin-block-start: 0.7em;
				margin-block-end: 0.7em;
				margin-inline-start: 0px;
				margin-inline-end: 0px;
				font-weight: bold;

			}
			.delight__widget-thankyou-modal .delight__widget-thankyou-modal-close {
				color: color: ${popup.headerFontColor};;
				float: right;
				font-size: 30px;
				font-weight: bold;
				padding-top: 7px
			}

			.delight__widget-thankyou-modal .delight__widget-thankyou-modal-close:hover,
			.delight__widget-thankyou-modal .delight__widget-thankyou-modal-close:focus {
				opacity: 0.6;
				text-decoration: none;
				cursor: pointer;
			}

			.delight__widget-thankyou-modal .modal-header {
				padding: 2px 16px;
				background-color: ${popup.headerBgColor};
				color: ${popup.headerFontColor};
			}


			.delight__widget-thankyou-modal .modal-body {
				padding: 0px 16px;
				background-color: ${popup.contentBgColor}
			}

			.delight__widget-thankyou-modal .modal-inner {
				border-top: 1.5px solid ${popup.sepColor} ;
				border-bottom: 1.5px solid ${popup.sepColor};
			}

			.delight__widget-thankyou-modal .button-wrapper {
				margin-bottom: 10px;
			}

			.delight__widget-thankyou-modal .modal-footer {
				/* margin-bottom: 10px; */
			}

			.delight__widget-thankyou-modal .modal-footer {
				padding: 2px 16px;
				text-align: right;
				padding-block-start: 0.9em;
				padding-block-end: 0.9em;
				margin-inline-start: 0px;
				margin-inline-end: 0px;
				color: ${popup.footerFontColor};
				background-color: ${popup.footerBgColor}
			}

			.delight__widget-thankyou-modal .modal-footer a {
				color: ${popup.footerFontColor};
				text-decoration: underline;
			}

			/*buttons*/
			.delight__widget-thankyou-modal .footer-button {
				margin-top: 10px;
				text-decoration: none;
				display: inline-block;
				padding: 8px 0px;
				border-radius: 5px;
				width: 202px;
				text-align: center;
				line-height: 23px;
				cursor: pointer;
				font-size: 1rem;
			}

			.delight__widget-thankyou-modal .previous {
				background-color: ${popup.skipBgColor};
				color: ${popup.skipFontColor};
				border: 1.5px solid ${popup.skipBorderColor};
			}

			.delight__widget-thankyou-modal .previous:hover {
				background-color: ${popup.skipHoverBgColor};
				color: ${popup.skipFontColor};
				border: 1.5px solid ${popup.skipBorderColor};
			}

			.delight__widget-thankyou-modal .next {
				background-color: ${popup.acceptBgColor};
				color: ${popup.acceptFontColor};
				border: 1.5px solid ${popup.acceptBorderColor};
			}

			.delight__widget-thankyou-modal .next:hover{
				background-color: ${popup.acceptHoverBgColor};
				color: ${popup.acceptFontColor};
				border: 1.5px solid ${popup.acceptBorderColor};
			}

			/* Slideshow container */
			.delight__widget-thankyou-modal .slideshow-container {
				max-width: 1000px;
				position: relative;
				margin: auto;
				margin-top: 10px;
			}

			/* The dots/bullets/indicators */
			.delight__widget-thankyou-modal .dot-wraper {
				text-align: center;
				display: flex;
				justify-content: center;
				margin-top: 10px;
			}

			.delight__widget-thankyou-modal .dot {
				margin: 0 5px;
				background-color: ${popup.badgeInBgColor};
				border-radius: 50%;
				display: inline-block;
				transition: background-color 0.6s ease;
				color: ${popup.badgeFontColor};
				padding: 1px 5.8px;
			}

			.delight__widget-thankyou-modal .active {
				background-color: ${popup.badgeAtBgColor};
			}

			/* Fading animation */
			.delight__widget-thankyou-modal .fade {
				animation-name: delight__widget-thankyou-modal-fade;
				animation-duration: 1.5s;
			}

			@keyframes delight__widget-thankyou-modal-fade {
				from {opacity: .4}
				to {opacity: 1}
			}

			/* On smaller screens, decrease text size */
			@media only screen and (max-width: 300px) {
				.delight__widget-thankyou-modal .prev,
				.delight__widget-thankyou-modal .next,
				.delight__widget-thankyou-modal .text {font-size: 11px}
			}

			/* Rewrad content*/
			.delight__widget-thankyou-modal .reward-wraper {
				display: flex;
				justify-content: space-between;
				max-height: 305px;
			}

			.delight__widget-thankyou-modal .reward-img {
				width: 40%;
    		height: 250px;
			}

			.delight__widget-thankyou-modal .reward-content {
				width: 56%;
				position: relative;
				color: ${popup.contentFontColor}
			}

			.delight__widget-thankyou-modal .delight--thankyou-detail {
				border-radius: 8px;
				/*border: 1px solid lightgray;*/
				/*padding: 12px;*/
				margin: 20px 0;
				margin-bottom: 30px;
			}

			.delight__widget-thankyou-modal .delight--thankyou-detail h4 {
				text-transform: unset;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				margin-bottom: 0;
				display: flex;
				justify-content: space-between;
				margin-top: 0;
				cursor: pointer
			}

			.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper {
				height: 110px;
				overflow-y: auto;
				margin-top: 10px;
				/*transition: height 0.2s;*/
				white-space: pre-wrap;
				word-break: break-word;
			}
			.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper .term-wrapper{
				margin-bottom:30px;
			}
			.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper.term {
				height: 56px;
				margin-top: 0px;
			}
			.delight__widget-thankyou-modal .delight--thankyou-detail-voucher-code{
				position: absolute;
				bottom: 0;
				font-size: 13px;
				font-weight:600;
				line-height: 13px;
				height: 13px;
				margin-bottom: 5px;
				display:flex;
			}
			.delight__widget-thankyou-modal .collapsed .delight--thankyou-detail-wrapper {
				margin-top: 0px;
				height: 0px;
			}

			.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper .text-link {
				color: blue;
			}

			.delight__widget-thankyou-modal .delight--thankyou-detail p {
				font-size: 15px;
			}

			.delight__widget-thankyou-modal .delight__widget-thankyou-modal--image-wraper {
				width: 40%;
			}

			.delight__widget-thankyou-modal .delight__widget-thankyou-modal--image-wraper .delight__widget-thankyou-modal--image {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			.delight__widget-thankyou-modal .delight__widget-thankyou-modal--content-wrapper {
				flex: 1;
			}

			.delight__widget-thankyou-modal .delight__widget-thankyou-modal--content-toggle-btn svg {
				transition: all 0.2s;
				transform: rotate(0deg);
			}

			.delight__widget-thankyou-modal .collapsed .delight__widget-thankyou-modal--content-toggle-btn svg {
				transform: rotate(180deg);
			}

			.delight__widget-thankyou-modal .voucher-copy-btn svg path{
				fill:#262424;
			}

			.delight__widget-thankyou-modal .voucher-code-copy{
				display:inline;
				cursor: pointer;
				width: 13px;
				height: 13px;
			}

			.delight__widget-thankyou-modal .voucher-code-check{
				display:none;
				width: 12px;
    		height: 12px;
			}

			.delight__widget-thankyou-modal .display-none{
				display:none;
			}

			.delight__widget-thankyou-modal .display-inline{
					display:inline;
			}

			.delight__widget-thankyou-modal .voucher-tooltip {
				position: relative;
				display: inline-block;
			}

			.delight__widget-thankyou-modal .voucher-tooltip .voucher-tooltiptext {
				visibility: hidden;
				width: 140px;
				background-color: transparent;
				text-align: center;
				border-radius: 6px;
				padding: 5px;
				position: absolute;
				z-index: 1;
				bottom: 100%;
				left: 50%;
				margin-left: -75px;
				opacity: 0;
				transition: opacity 0.3s;
				font-weight: 400;
			}

			.delight__widget-thankyou-modal .voucher-tooltip:hover .voucher-tooltiptext {
				visibility: visible;
				opacity: 0.8;
			}

			@media only screen and (max-width: 720px) {
				.delight__widget-thankyou-modal .modal-content {
					width: 80%
				}

				.delight__widget-thankyou-modal .reward-img {
					height: 180px;
				}

				.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper {
					height: 90px;
				}

				.delight__widget-thankyou-modal .collapsed .delight--thankyou-detail-wrapper {
					height: 0px !important;
				}

				.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper.term {
					height: 40px;
				}

				.delight__widget-thankyou-modal .footer-button {
					width: 190px;
				}

			}

			@media only screen and (max-width: 640px) {
				.delight__widget-thankyou-modal .modal-content {
					width: 80%
				}

				.delight__widget-thankyou-modal .reward-wraper {
					display: block;
					max-height: unset;
				}

				.delight__widget-thankyou-modal .reward-img {
					width: 100%;
					height: auto;
					min-height: unset;
				}

				.delight__widget-thankyou-modal .reward-content {
					width: 100%;
					margin-top: 10px;
				}

				.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper.desc{
					height: auto ;
				}

				.delight__widget-thankyou-modal .delight--thankyou-detail-wrapper.term {
					height: auto;
				}

				.delight__widget-thankyou-modal .delight--thankyou-detail {
					margin-bottom: 16px !important;
				}

				.delight__widget-thankyou-modal .delight--thankyou-detail-voucher-code {
					position: unset;
				}

				.delight__widget-thankyou-modal .modal-footer
				{
					display: flex;
					flex-flow: wrap;
				}
				.delight__widget-thankyou-modal .footer-button {
					width: 100%;
				}

			}
			</style>

			<!-- The Modal -->
			<div id="delight__widget_thankyou_modal" class="delight__widget-thankyou-modal">
				<!-- Modal content -->
				<div class="modal-content">
					<div class="modal-header">
						<span class="delight__widget-thankyou-modal-close">×</span>
						<h2>${popup.headerContent}</h2>
					</div>
					<div class="modal-body">
						<div class="modal-inner">
							<div class="dot-wraper" style="${isFlex}">
								${strDot}
							</div>
							<div class="slideshow-container">
								${strContent}
							</div>
							<div class="button-wrapper">
								<a class="footer-button  previous" onclick="plusSlides(1)">No, thanks</a>
								<a class="footer-button next" onclick="visitReward(1)">Yes, please</a>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<div>${popup.footerContent}</div>
					</div>
				</div>
			</div>
		`
}

function showSpinLoading() {
	if (Delight?.pageName == "thank_you") {
		var loadingDiv = document.createElement("div");
		loadingDiv.id = 'delight___spin_loading_id';
		loadingDiv.innerHTML = strLoading;
		document.body.appendChild(loadingDiv);
	}
}

function hideSpinLoading() {
	var loadDiv = document.getElementById("delight___spin_loading_id");
	if (loadDiv != null) {
		loadDiv.style.display = 'none';
	}
}

//slider
let slideIndex = 1;

if (document.readyState === "complete") {
	showSpinLoading()
}

let stateCheck = setInterval(async () => {
	if (document.readyState === 'complete') {
		clearInterval(stateCheck);

		await delightPopupInit();
		createPopup();

		hideSpinLoading();

		// Create the div for modal
		var myDiv = document.createElement("div");

		//Set its unique ID.
		myDiv.id = 'div_id';

		//Add your content to the DIV
		myDiv.innerHTML = strModal;

		//Finally, append the element to the HTML body
		document.body.appendChild(myDiv);

		// Get the modal
		var delight__widget_thankyou_modal = document.getElementById("delight__widget_thankyou_modal");

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("delight__widget-thankyou-modal-close")[0];

		// When the user clicks on <span> (x), close the modal
		if (span) {
			span.onclick = function () {
				delight__widget_thankyou_modal.style.display = "none";
			}
		}

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function (event) {
			if (event.target == delight__widget_thankyou_modal) {
				delight__widget_thankyou_modal.style.display = "none";
			}
		}

		if (rewards?.length > 0) {
			showPopup();
		}
	}
}, 100);


function plusSlides(n) {
	showSlides(slideIndex += n);
}

function visitReward(n) {
	plusSlides(n);
	window.open(rewards[slideIndex - 2].url, '_blank');
}

function currentSlide(n) {
	showSlides(slideIndex = n);
}

function showSlides(n) {
	let i;
	let slides = document.getElementsByClassName("popupSlides");
	let dots = document.getElementsByClassName("dot");

	// Get the modal
	var delight__widget_thankyou_modal = document.getElementById("delight__widget_thankyou_modal");

	if (n > slides.length) { delight__widget_thankyou_modal.style.display = "none"; return; }

	for (i = 0; i < slides.length; i++) {
		slides[i].style.display = "none";
	}
	slides[slideIndex - 1].style.display = "block";

	for (i = 0; i < dots.length; i++) {
		dots[i].style.display = "none";
	}
	for (i = slideIndex - 1; i < dots.length; i++) {
		dots[i].style.display = "block";
	}
	dots[slideIndex - 1].className += " active";

}

function toggleContent(event) {
	const parentElement = event.target.closest(
		".delight--thankyou-detail"
	)
	const content = parentElement.querySelector(
		".delight--thankyou-detail-wrapper"
	)
	// if (parentElement.classList.contains("collapsed")) {
	//   content.style.height = content.scrollHeight + "px"
	// } else {
	//   content.style.height = 0
	// }
	parentElement.classList.toggle("collapsed")
}

function showPopup() {
	showSlides(slideIndex);
	var delight__widget_thankyou_modal = document.getElementById("delight__widget_thankyou_modal");
	delight__widget_thankyou_modal.style.display = "block";
}

function copyVoucherCode(event, voucherCode) {
	copyBtn = event.target.closest('.voucher-copy-btn');
	codeCopy = copyBtn.querySelector(".voucher-code-copy")
	codeCheck = copyBtn.querySelector(".voucher-code-check")
	codeTooltip = copyBtn.querySelector(".voucher-tooltiptext")

	codeCopy.classList.add('display-none');
	codeCopy.classList.remove('display-inline');

	codeCheck.classList.add('display-inline');
	codeCheck.classList.remove('display-none');
	var copyText = voucherCode;
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(copyText);
	} else {
		let textArea = document.createElement("textarea");
		textArea.value = copyText;
		// make the textarea out of viewport
		textArea.style.position = "fixed";
		textArea.style.left = "-999999px";
		textArea.style.top = "-999999px";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		new Promise((res, rej) => {
			// here the magic happens
			document.execCommand('copy') ? res() : rej();
			textArea.remove();
		});
	}
	codeTooltip.innerHTML = 'copied';
	setTimeout(function render() {
		codeCopy.classList.add('display-inline');
		codeCopy.classList.remove('display-none');

		codeCheck.classList.add('display-none');
		codeCheck.classList.remove('display-inline');
		codeTooltip.innerHTML = 'copy';
	}, 500);
}