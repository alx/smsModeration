# Hardware requirements

Current installation of smsModeration is running on a *nix laptop with ruby install, and the sms are coming from an Android phone running SMS Gateway app.

![Network Schema](https://raw.github.com/alx/smsModeration/master/documentation/network.png)

# Moderation Interface Install

smsModeration uses rvm and bundler to manage ruby version and gem packages.

To install necessary ruby gems for this apps, just launch bundler inside smsModeration folder:

```
bundle install
```

To run the moderation interface and be able to receive sms on this interface, you can run the application with:

```
shotgun smssync.rb
```

Now you can use your browser to connect to moderation interface: [http://localhost:9393](http://localhost:9393)

If the moderation machine is on the network, you can connect from a browser on a different machine: [http://machine.ip:9393](http://machine.ip:9393)

# Android SMS Gateway

On the Android phone receiving the SMS, you need to install SMS Gateway app.

Configure this app to send all incoming sms to the computer running the moderation interface.

In this configuration, the device name need to be set to "gateway".

# Using Moderation Interface

![Moderation Interface](https://raw.github.com/alx/smsModeration/master/documentation/moderation_interface.png)

Moderation interface is composed by 4 columns.

## Messages received

Messages arrive in the column on the left. From there you can choose to keep a message or not.

* The number of messages available is display on top of this column
* A timer is available on top of the column to let you know when the list will be refreshed
* You can refresh the list manually with the blue refresh button
* You can trash all items on this list by pressing the red trash button

## Current selection

The second column shows the messages of your current selection.

A counter is available on top of the column to indicate you how many messages are in the current selection.

You can make a new selection by pressing on the blue "New Selection" button. The current selection serial is indicated on this button.

On each messages from this column, you can choose to remove a message from the selection or to favorite it.

## Favorites

The third column displays your favorite messages.

You can remove the favorite status of a message by pressing on the yellow star button.

You can add a message to the current selection by pressing on the blue select button.

## All messages

The fourth and last column shows all the selected messages. Because the number of selected messages can be huge, you need to press the "Display all" button on top of the column to display them.

You can add a message from this list to the current selection by pressing on the blue select button.

# Gource

![Gource display](https://raw.github.com/alx/smsModeration/master/documentation/grouce.png)

It's possible to create a [gource](https://code.google.com/p/gource/) video to display the sms activity by using the script in the ```gource``` folder.

## Examples

* [SMS Activity with Users](https://vimeo.com/58178587)
* [SMS Activity without Users](https://vimeo.com/58249481)

# Know issues

* Current limitation to about 1 sms every 3 seconds on a HTC Desire. This could be due to gsm network or SMS Gateway application, more tests need to be done to improve this performance issue
* This installation might not be gsm-contract-compliant, you might need to ask your gsm provider before abusing their network and risking getting your access down
* Some issues opening the moderation interface on Windows
