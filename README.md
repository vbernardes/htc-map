# Humane Tech Community Map

## About
The idea for the Humane Tech Community Map originated in February 2018 in [a topic](https://community.humanetech.com/t/map-design-wanted-mapping-local-meetups/1132) on the [Humane Tech Community Forum](https://community.humanetech.com). The goal is to map local meetup groups to make it easier to find relevant people and places in the user’s area.

The map can be found on the [Meetup Chapters](https://humanetech.community/activities/meetup-chapters/) page on the Humane Tech Community website.

## Status of the Project & Contributions

Two categories are being displayed in the community map:

- **Humane Tech Community Meetup Chapters**—chapters officially related to the HTC Community)
- **Other Humane Technology-related Meetup Groups**—which are not related to the Humane Tech Community, but are also covering topics in the field of Humane Technology

### Add events to the Community Map

1. Organize a chapter using [meetup.com]() and use the Humane Tech Community [logos](https://github.com/humanetech-community/styleguide/tree/master/logos).
2. Create a topic in the forum in [Events & Meetups](https://community.humanetech.com/c/central/meetups) with the group information.
3. The forum moderators will add the entries to the website.

## Usage examples
The categories mentioned in the previous section can be used to define an initial state of the map.

- Say you want to view HTC-affiliated Meetup Chapters. Append `?show=chapters` to the URI and only those chapters will be loaded into the map at start.
- Multiple parameters are also possible: `?show=chapters,groups` will display both the `chapters` and the `group` layers.

## Embed the map
Simply click the embed button ![embed icon](resources/embed-icon.png) inside the map and you will find the embed code ready to be copied. The embed code provided there will update itself according to the layers you select.

The embed code uses an [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe). Please modify the `width` and `height` parameters to your liking.

## Acknowledgements
A **huge** thank you to the developers of the [Fairphone Community Map](https://github.com/WeAreFairphone/fprsmap/). This project initially took their completed map and it just took us a few tweaks here and there to get our version up and running.

And don’t forget to take a look at what’s happening over at the [HTC Community Forum](https://community.humanetech.com)!
