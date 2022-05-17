// Initialize button with user's preferred color
let start = document.getElementById("start");

// chrome.storage.sync.get("color", ({ color }) => {
//   start.style.backgroundColor = color;
// });

// When the button is clicked, inject setPageBackgroundColor into current page
start.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: startShortlist,
    },
    function () {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText =
          "There was an error injecting script : \n" +
          chrome.runtime.lastError.message;
      }
    }
  );
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The body of this function will be executed as a content script inside the
// current page
async function startShortlist() {
  let postings = document.getElementsByClassName("searchResult");
  // console.log(postings);

  for (let i = 0; i < postings.length; i++) {
    let targLink = postings[i];
    let clickEvent = document.createEvent("MouseEvents");
    clickEvent.initEvent("dblclick", true, true);
    targLink.dispatchEvent(clickEvent);

    await new Promise((r) =>
      setTimeout(function () {
        let x = document.getElementsByClassName("badge badge-info inline")[0];

        if (x === undefined) {
          console.log('no score, skipping')
        }
        else {
          let y = x.children[0];
          console.log(x, y);
  
          var split = y.innerText.split("/");
          var result = parseInt(split[0], 10) / parseInt(split[1], 10);
  
          if (result >= 0.85) {
            // click shortlist
            console.log("WOW");
            let sbtn = document.getElementById("modal-btn-shortlist");
  
            if (sbtn.innerText !== "UNSHORTLIST") {
              sbtn.click();
            }
  
          }
          
          let close = document.querySelector(
            "#popup-modal > div > div > div.modal-header > button"
          );
          close.click();
          r("done");
        }

      }, 2000)
    );

    await new Promise((r) => setTimeout(r, 1000)); // sleep?
  }
}
