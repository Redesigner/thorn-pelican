class Gallery
{
    constructor(rootElement, slotCount)
    {
        this.slotCount = slotCount;
        this.slotOffset = 0;

        var intendedSlotCount = this.slotCount;

        var exhibitElement = rootElement;
        var miniGalleryElement = exhibitElement.getElementsByClassName('mini-gallery')[0];
        var meta = imageSrcRaw = exhibitElement.getElementsByClassName('srccontainer')[0];
        var title = meta.getAttribute('title');

        var imageSrcRaw = meta.getAttribute('url');
        this.imageSrc = imageSrcRaw.split(';');

        if (this.imageSrc[0].trim().split('.')[1] == "youtube-nocookie")
        {
            let videoSrc = this.imageSrc[0].trim();
            var videoContainer = new VideoContainer(exhibitElement, videoSrc);
            videoContainer.element.addEventListener('click', function(){
                setVideoPlayer(exhibitElement, videoSrc);
            });
            videoContainer.element.setAttribute('class', 'primary');
            exhibitElement.insertBefore(videoContainer.element, exhibitElement.firstChild);
        }
        else
        {
            var exhibitMainDisplay = document.createElement("img");
            exhibitMainDisplay.setAttribute('src', 'images/' + title + '/' + this.imageSrc[0].trim());
            exhibitMainDisplay.setAttribute("class", "primary");
            exhibitElement.insertBefore(exhibitMainDisplay, exhibitElement.firstChild);
        }

        if (intendedSlotCount > 1)
        {
            if (this.imageSrc.length > intendedSlotCount)
            {
                slotCount -= 1;
                this.slotCount -= 1;

                var leftArrow = document.createElement('li');
                leftArrow.textContent = ">";
                leftArrow.setAttribute('class', 'arrowLeft');

                let gallery = this;
                leftArrow.addEventListener('click', function() {
                    gallery.shiftSlots(-1)
                });

                miniGalleryElement.appendChild(leftArrow);
            }

            // Create the slots
            this.gallerySlots = Array(slotCount);
            for (var i = 0; i < slotCount; i++)
            {
                var miniGalleryListItem = document.createElement('li');
                miniGalleryListItem.setAttribute('class', 'gallery-item');
                this.gallerySlots[i] = miniGalleryListItem;
                miniGalleryElement.appendChild(miniGalleryListItem);
            }

            // Create the virtual elements for all of our gallery entries
            this.galleryItems = new Array(this.imageSrc.length);
            for (var i = 0; i < this.imageSrc.length; i++)
            {
                // if the domain is youtube, this is probably a video link
                // Use privacy-enhanced embeds only, to prevent youtube tracking
                let localSrc = this.imageSrc[i].trim();
                var galleryItem;
                if (localSrc.search("youtube") >= 0)
                {
                    galleryItem = new VideoContainer(exhibitElement, localSrc);
                }
                else
                {
                    galleryItem = new ImageContainer(exhibitElement, 'images/' + title + '/' + localSrc);
                }
                this.galleryItems[i] = galleryItem;

                // Fill the open slot, if it exists
                if (i < slotCount)
                {
                    this.gallerySlots[i].appendChild(galleryItem.element);
                }
            }

            // Generate the right arrow
            if (this.imageSrc.length > intendedSlotCount)
            {
                var rightArrow = document.createElement('li');
                rightArrow.textContent = ">";
                rightArrow.setAttribute('class', 'arrowRight');

                let gallery = this;
                rightArrow.addEventListener('click', function() {
                    gallery.shiftSlots(1)
                });

                miniGalleryElement.appendChild(rightArrow);
            }
        }
    }

    shiftSlots(amount)
    {
        this.slotOffset = (this.slotOffset + amount) % (this.galleryItems.length);
        if (this.slotOffset < 0)
        {
            this.slotOffset += this.slotCount + 1;
        }
        for(var i = 0; i < this.slotCount; i++)
        {
            var oldImage = this.gallerySlots[i].getElementsByTagName('img')[0];
            if (oldImage != null)
            {
                this.gallerySlots[i].removeChild(oldImage);
            }
            this.gallerySlots[i].appendChild(this.galleryItems[(this.slotOffset + i) % (this.galleryItems.length)].element);
        }
    }
}

class GalleryItem
{
    constructor(element)
    {
        this.element = element;
    }
}

class ImageContainer extends GalleryItem
{
    constructor(rootElement, src)
    {
        var element = document.createElement("img");
        element.setAttribute('src', src);

        super(element);

        let clickTarget = rootElement;
        let clickElement = element;

        element.addEventListener("click", function(){
            onButtonClickEvent(clickTarget, clickElement);
        });
    }
}

class VideoContainer extends GalleryItem
{
    constructor(rootElement, url)
    {
        var element = document.createElement("div");
        element.setAttribute("class", "videocontainer");

        super(element);
        
        var videoIDIndex = url.search('/embed/');
        var videoID = url.substr(videoIDIndex + 7, 11);
        var thumbSrc = 'http://img.youtube.com/vi/' + videoID + '/0.jpg';

        var subImage = document.createElement("img")
        subImage.setAttribute('src', thumbSrc);
        subImage.setAttribute('class', 'thumbnail');

        var playbutton = document.createElement("img");
        playbutton.setAttribute('src', 'theme/img/playbutton.svg')
        playbutton.setAttribute('class', 'playbutton');

        var meta = document.createElement("meta");
        meta.setAttribute('video', url.trim());

        element.appendChild(subImage);
        element.appendChild(playbutton);
        element.appendChild(meta);

        let clickTarget = rootElement;
        let clickElement = element;
        
        element.addEventListener("click", function(){
            onButtonClickEvent(clickTarget, clickElement);
        });
    }
}

function onButtonClickEvent(owner, clicked)
{
    var primaryExhibit = owner.getElementsByClassName("primary")[0];
    var newElement = clicked.cloneNode(true);
    newElement.setAttribute("class", "primary");
    owner.replaceChild(newElement, primaryExhibit);

    var video = newElement.getElementsByTagName('meta');
    if (video.length > 0)
    {
        let meta = video[0].getAttribute("video");
        newElement.addEventListener('click', function(){
            setVideoPlayer(owner, meta);
        });
    }
}

function setVideoPlayer(owner, video)
{
    var iFrame = document.createElement('iframe');
    var primaryExhibit = owner.getElementsByClassName("primary")[0];
    iFrame.setAttribute("src", video);
    iFrame.setAttribute("class", "primary");
    owner.replaceChild(iFrame, primaryExhibit);
}

var galleries = document.getElementsByClassName('exhibit');
for (var i = 0; i < galleries.length; i++)
{
    var meta = galleries[i].getElementsByClassName('srccontainer')[0];
    var imageSrcRaw = meta.getAttribute('url');
    var imageSrc = imageSrcRaw.split(';');
    var gallerySize = imageSrc.length;
    if (gallerySize > 5)
    {
        gallerySize = 5;
    }
    new Gallery(galleries[i], gallerySize);
}