document.addEventListener('DOMContentLoaded', function () {
    // Find the element with the ID "nav"
    var navElement = document.getElementById('nav');
    // Check if the element exists
    if (navElement) {
        // Replace the "|" with "<span>|</span>"
        navElement.innerHTML = navElement.innerHTML.replace(/\|/g, '<span class="authguard-seprator">|</span>');
    }
    // if(document.querySelector('.footer-cont').innerHTML == ''){
    //     document.querySelector('.footer-wrapper').style.display = "none";
    // }
});