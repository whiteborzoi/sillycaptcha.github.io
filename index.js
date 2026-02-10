// make the checkbox div focusable
const captchaCheckbox = document.getElementById("captcha-checkbox")
const checkboxSpinner = document.getElementById("captcha-checkbox-spinner")
captchaCheckbox.addEventListener("mousedown",()=> {
    captchaCheckbox.classList.add("focused")
    captchaCheckbox.classList.remove("blurred")
})

captchaCheckbox.addEventListener("mouseup",()=> {
    captchaCheckbox.classList.add("blurred")
    captchaCheckbox.classList.remove("focused")
})

// CAPTCHA logic state
let currentChallenge = '';
let correctIndices = [];
let selectedIndices = [];
let isVerified = false;
let allImages = []; // Store all 9 image elements

// Challenge categories and images mapping
// Assuming you have 15 images total (img1.jpg to img15.jpg)
// We'll assign categories to different sets of images
const imageCategories = {
    1: 'sonechka', 2: 'sonechka', 3: 'sonechka', 4: 'sonechka', 5: 'sonechka',
    6: 'not_sonechka', 7: 'not_sonechka', 8: 'not_sonechka', 9: 'not_sonechka', 10: 'not_sonechka',
    11: 'not_sonechka', 12: 'not_sonechka', 13: 'not_sonechka', 14: 'not_sonechka', 15: 'not_sonechka'
};

// Available challenge types
const challengeTypes = ['sonechka', 'not_sonechka', 'not_sonechka'];

// Get random challenge type
function getRandomChallengeType() {
    return challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
}

// Generate random image numbers (1-15) for the grid
function generateRandomImageSet() {
    const images = [];
    const usedNumbers = new Set();
    
    // Generate 9 unique random numbers between 1 and 15
    while (images.length < 9) {
        const randomNum = Math.floor(Math.random() * 15) + 1;
        if (!usedNumbers.has(randomNum)) {
            usedNumbers.add(randomNum);
            images.push(randomNum);
        }
    }
    
    return images;
}

// Set up challenge with random images
function setupChallenge() {
    currentChallenge = getRandomChallengeType();
    document.getElementById("solve-title-text").textContent = currentChallenge;
    
    // Generate new random images for the grid
    const randomImageNumbers = generateRandomImageSet();
    
    // Update all image sources
    const imageElements = document.querySelectorAll('.solve-image');
    randomImageNumbers.forEach((imgNum, index) => {
        imageElements[index].src = `./images/img${imgNum}.jpg`;
        imageElements[index].dataset.category = imageCategories[imgNum];
        imageElements[index].dataset.index = index;
    });
    
    // Find which indices are correct (match current challenge)
    correctIndices = [];
    imageElements.forEach((img, index) => {
        if (img.dataset.category === currentChallenge) {
            correctIndices.push(index);
        }
    });
    
    // Reset selection state
    selectedIndices = [];
    isVerified = false;
    
    // Clear any selection borders
    imageElements.forEach(img => {
        img.style.border = 'none';
    });
    
    // Hide error message
    document.getElementById("solve-image-error-msg").style.display = "none";
}

// Check if CAPTCHA is solved
function checkCaptcha() {
    // Check if all correct images are selected and no incorrect ones
    const allSelectedCorrect = selectedIndices.every(index => correctIndices.includes(index));
    const allCorrectSelected = correctIndices.every(index => selectedIndices.includes(index));
    
    return allSelectedCorrect && allCorrectSelected && selectedIndices.length === correctIndices.length;
}

captchaCheckbox.addEventListener("click",()=> {
    checkboxSpinner.style.display = "block"
    captchaCheckbox.style.display = "none"
    captchaCheckbox.style.visibility = "false"
    
    setTimeout(()=>{
        captchaCheckbox.style.display = "block"
        checkboxSpinner.style.display = "none"

        // show the solve box
        const solveBox = document.getElementById("solve-box")
        if (solveBox.style.display == "block") {
            solveBox.style.display = "none"
            isVerified = false;
        }
        else {
            solveBox.style.display = "block"
            setupChallenge(); // Set up new challenge when box opens
        }
    },Math.floor(Math.random()*1000)+200)
})

// show error if submit button is click without checking the checkbox
document.getElementById("submit").addEventListener("click",()=>{
    if (!isVerified) {
        document.getElementById("captcha-main-div").classList.add("error")
        document.getElementById("captcha-error-msg").style.display = "block"
    } else {
        document.getElementById("captcha-main-div").classList.remove("error")
        document.getElementById("captcha-error-msg").style.display = "none"
        alert("Form submitted successfully!");
    }
})

// fill up the solve-image-container with initial images
const imageCount = 15
const solveImageContainer = document.getElementById("solve-image-main-container")
// Store initial image numbers
const initialImageNumbers = [];

for (let i=0; i<3; i++) {
    for (let j=0; j<3; j++) {
        const imageContainer = document.createElement("div")
        imageContainer.classList.add("solve-image-container")

        const imageIndex = (i * 3) + j;
        // Start with sequential images 1-9
        const imgNum = imageIndex + 1;
        initialImageNumbers.push(imgNum);
        
        const image = document.createElement("img")
        image.setAttribute("src",`./images/img${imgNum}.jpg`)
        image.classList.add("solve-image")
        image.dataset.index = imageIndex;
        image.dataset.category = imageCategories[imgNum];
        
        // Store reference to image element
        allImages.push(image);
        
        // Click handler for image selection
        image.addEventListener("click",()=>{
            const index = parseInt(image.dataset.index);
            
            if (isVerified) return; // Don't allow changes after verification
            
            // Toggle selection
            if (selectedIndices.includes(index)) {
                // Deselect
                selectedIndices = selectedIndices.filter(idx => idx !== index);
                image.style.border = 'none';
            } else {
                // Select
                selectedIndices.push(index);
                image.style.border = '3px solid rgb(26,115,232)';
            }
            
            // Hide error message when user interacts
            document.getElementById("solve-image-error-msg").style.display = "none";
        })
        
        imageContainer.appendChild(image)
        solveImageContainer.appendChild(imageContainer)
    }
}

// Initialize correct indices for the initial setup
correctIndices = allImages
    .map((img, index) => img.dataset.category === 'sonechka' ? index : -1)
    .filter(index => index !== -1);

// Set initial challenge to 'sonechka'
currentChallenge = 'sonechka';
document.getElementById("solve-title-text").textContent = currentChallenge;

// verify button logic
document.getElementById("verify").addEventListener("click",()=> {
    if (checkCaptcha()) {
        // CAPTCHA solved successfully
        isVerified = true;
        document.getElementById("solve-image-error-msg").style.display = "none";
        document.getElementById("solve-box").classList.add("fade-out");
        
        setTimeout(() => {
            document.getElementById("solve-box").style.display = "none";
            document.getElementById("solve-box").classList.remove("fade-out");
            document.getElementById("captcha-error-msg").style.display = "none";
            document.getElementById("captcha-main-div").classList.remove("error");
            alert("YAPPYYYY YOU DID IT!!!!!!");
        }, 1000);
    } else {
        // CAPTCHA failed
        document.getElementById("solve-image-error-msg").style.display = "block";
        document.getElementById("solve-image-error-msg").textContent = "try again";
        
        // Clear selection
        selectedIndices = [];
        allImages.forEach(img => {
            img.style.border = 'none';
        });
    }
})

// refresh everything when refresh is clicked - GET NEW CHALLENGE
const refreshButton = document.getElementById("refresh")
refreshButton.addEventListener("click",()=>{
    refreshButton.style.pointerEvents = "none"
    solveImageContainer.classList.add("fade-out")
    document.getElementById("solve-image-error-msg").style.display = "none"
    
    setTimeout(()=> {
        solveImageContainer.classList.remove("fade-out")
        
        // Set up completely new challenge with new random images
        setupChallenge();
        
        refreshButton.style.pointerEvents = "auto"
    },500)
})

// toggle information
document.getElementById("information").addEventListener("click",() =>{
    const information = document.getElementById("information-text")
    if (information.style.display == "block") {
        information.style.display = "none"
    }
    else {
        information.style.display = "block"
    }
})

// show audio div 
document.getElementById("audio").addEventListener("click",()=> {
    document.getElementById("solve-image-div").style.display = "none"
    document.getElementById("solve-audio-div").style.display = "block"
})

// Also hide audio div when refresh is clicked
refreshButton.addEventListener("click", () => {
    document.getElementById("solve-image-div").style.display = "block"
    document.getElementById("solve-audio-div").style.display = "none"
})