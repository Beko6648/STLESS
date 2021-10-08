from mylib.centroidtracker import CentroidTracker
from mylib.trackableobject import TrackableObject
from imutils.video import VideoStream
from imutils.video import FPS
from mylib.mailer import Mailer
from mylib import config
import time
import numpy as np
import argparse
import imutils
import time
import dlib
import cv2
import datetime
from itertools import zip_longest
import threading
import json
import pytz


t0 = time.time()
total_leave = 0
total_enter = 0
total = 0 # get_dictのための変数
total_people_inside = 0


def run(vs, frame_name):
    # print(frame_name)
    args = {'prototxt': 'mobilenet_ssd/MobileNetSSD_deploy.prototxt',
            'model': 'mobilenet_ssd/MobileNetSSD_deploy.caffemodel',
            'input': 'videos/example_01.mp4',
            'output': None,
            'confidence': 0.4,
            'skip_frames': 15}

    CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
            "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
            "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
            "sofa", "train", "tvmonitor"]

    net = cv2.dnn.readNetFromCaffe(args["prototxt"], args["model"])

    if not args.get("input", False):
        # print("[INFO] Starting the live stream..")
        vs = VideoStream(config.url).start()
        time.sleep(2.0)
    # else:
        # print("[INFO] Starting the video..")
        # vs = cv2.VideoCapture(args["input"])
        # vs = cv2.VideoCapture(camera_num)

    writer = None
    W = None
    H = None

    ct = CentroidTracker(maxDisappeared=40, maxDistance=50)
    trackers = []
    trackableObjects = {}

    totalFrames = 0

    fps = FPS().start()

    while True:
        frame = vs.read()
        frame = frame[1] if args.get("input", False) else frame

        if args["input"] is not None and frame is None:
            break

        frame = imutils.resize(frame, width=500)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        if W is None or H is None:
            (H, W) = frame.shape[:2]

        if args["output"] is not None and writer is None:
            fourcc = cv2.VideoWriter_fourcc(*"MJPG")
            writer = cv2.VideoWriter(args["output"], fourcc, 15, (W, H), True)

        status = "Waiting"
        rects = []

        if totalFrames % args["skip_frames"] == 0:
            status = "Detecting"
            trackers = []
            blob = cv2.dnn.blobFromImage(frame, 0.007843, (W, H), 127.5)
            net.setInput(blob)
            detections = net.forward()

            for i in np.arange(0, detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > args["confidence"]:
                    idx = int(detections[0, 0, i, 1])

                    if CLASSES[idx] != "person":
                        continue

                    box = detections[0, 0, i, 3:7] * np.array([W, H, W, H])
                    (startX, startY, endX, endY) = box.astype("int")

                    tracker = dlib.correlation_tracker()
                    rect = dlib.rectangle(startX, startY, endX, endY)
                    tracker.start_track(rgb, rect)

                    trackers.append(tracker)
        else:
            for tracker in trackers:
                status = "Tracking"

                tracker.update(rgb)
                pos = tracker.get_position()

                startX = int(pos.left())
                startY = int(pos.top())
                endX = int(pos.right())
                endY = int(pos.bottom())

                rects.append((startX, startY, endX, endY))

        cv2.line(frame, (0, H // 2), (W, H // 2), (0, 0, 0), 3)
        cv2.putText(frame, "-Prediction border - Entrance-", (10, H - ((i * 20) + 200)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

        objects = ct.update(rects)

        for (objectID, centroid) in objects.items():
            to = trackableObjects.get(objectID, None)

            if to is None:
                to = TrackableObject(objectID, centroid)
            else:
                y = [c[1] for c in to.centroids]
                direction = centroid[1] - np.mean(y)
                to.centroids.append(centroid)

                if not to.counted:
                    global total_leave
                    global total_enter
                    # global list empty = []
                    # global list empty1 = []
                    global total_people_inside
                    if direction < 0 and centroid[1] < H // 2:
                        total_leave += 1

                        print(json.dumps(get_dict_data('leave')))
                        to.counted = True
                    elif direction > 0 and centroid[1] > H // 2:
                        total_enter += 1
                        print(json.dumps(get_dict_data('enter')))
                        
                        if total_people_inside >= config.Threshold:
                            cv2.putText(frame, "-ALERT: People limit exceeded-", (10, frame.shape[0] - 80),
                                        cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 0, 255), 2)
                            if config.ALERT:
                                # print("[INFO] Sending email alert..")
                                Mailer().send(config.MAIL)
                                # print("[INFO] Alert sent")
                        to.counted = True
                    total_people_inside = total_enter - total_leave

            trackableObjects[objectID] = to
            text = "ID {}".format(objectID)
            cv2.putText(frame, text, (centroid[0] - 10, centroid[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            cv2.circle(
                frame, (centroid[0], centroid[1]), 4, (255, 255, 255), -1)

        info = [
            ("Leave", total_leave),
            ("Enter", total_enter),
            ("Status", status),
        ]

        info2 = [
            ("Total people inside", total_people_inside),
        ]

        for (i, (k, v)) in enumerate(info):
            text = "{}: {}".format(k, v)
            cv2.putText(frame, text, (10, H - ((i * 20) + 20)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

        for (i, (k, v)) in enumerate(info2):
            text = "{}: {}".format(k, v)
            cv2.putText(frame, text, (265, H - ((i * 20) + 60)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        cv2.imshow(frame_name, frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break

        totalFrames += 1
        fps.update()

    fps.stop()
    # print("[INFO] elapsed time: {:.2f}".format(fps.elapsed()))
    # print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

    if config.Thread:
        vs.release()

    cv2.destroyAllWindows()


def get_dict_data(access):
    global total
    dt_now = datetime.datetime.now(pytz.timezone('Asia/Tokyo'))
    # 2018-12-31T05:00:30 という形式
    time_str = dt_now.isoformat(timespec='seconds')
    if(access == 'enter'):
        total += 1
    elif(access == 'leave'):
        total -= 1

    dict = {
        "time_data": time_str,
        "enter_or_leave": access,
        "people_count": total
    }
    return dict


# url = "http://10.10.51.151:8080/?action=stream"
vs0 = cv2.VideoCapture('videos/sample1.mp4')
vs1 = cv2.VideoCapture('videos/example_01.mp4')
thread1 = threading.Thread(target=run, args=(vs0, 'frame1'))
thread2 = threading.Thread(target=run, args=(vs1, 'frame2'))
thread1.start()
thread2.start()
thread1.join()
thread2.join()

# print('end')
