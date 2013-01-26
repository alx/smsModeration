# Hardware requirements

Current installation of smsModeration is running on a *nix laptop with ruby install, and the sms are coming from an Android phone running SMS Gateway app.

!img_of_app_network

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

# Android SMS [[Gateway]]

On the Android phone receiving the SMS, you need to install SMS Gateway app.

Configure this app to send all incoming sms to the computer running the moderation interface.

In this configuration, the device name need to be set to "gateway".
