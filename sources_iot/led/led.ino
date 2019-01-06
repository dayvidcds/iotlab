// LIBRARYS
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 4  //D2
#define RST_PIN 5 //D1
MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance.

MFRC522::MIFARE_Key key;

// VARIABLES
const char* SSID = "DIREITO PROCESSUAL CIVIL"; // rede wifi
const char* PASSWORD = "cervejagelada"; // senha da rede wifi

const char* BROKER_MQTT = "191.179.215.37"; // ip/host do broker
int BROKER_PORT = 1883; // porta do broker

const char* TOPIC_PING = "btnStatus";
const char* TOPIC_PONG = "btnStatus";

// PROTOTYPES
void initPins();
void initSerial();
void initRfid();
void initMQTT();

// OBJECTS
WiFiClient client;
PubSubClient MQTT(client); // instancia o mqtt

// setup
void setup() {
  Serial.begin(115200);   // Initiate a serial communication
  initWiFi();
  initMQTT();
  pinMode(2, OUTPUT);
}

void loop() {
  if (!MQTT.connected()) {
    reconnectMQTT();
  }
  recconectWiFi();
  MQTT.loop();
  //enviar();
  delay(100);
}

void initWiFi() {
  delay(10);
  Serial.println("Conectando-se em: " + String(SSID));

  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Conectado na Rede " + String(SSID) + " | IP => ");
  Serial.println(WiFi.localIP());
}

// Funcão para se conectar ao Broker MQTT
void initMQTT() {
  MQTT.setServer(BROKER_MQTT, BROKER_PORT);
  MQTT.setCallback(mqtt_callback);
}

//Função que recebe as mensagens publicadas
void mqtt_callback(char* topic, byte* payload, unsigned int length) {

  String message;
  for (int i = 0; i < length; i++) {
    char c = (char)payload[i];
    message += c;
  }
  Serial.println("Tópico => " + String(topic) + " | Valor => " + String(message));
  if (String(message) == "On") {
    digitalWrite(2, LOW);
  }
  else {
    digitalWrite(2, HIGH);
  }
  Serial.flush();
}

void reconnectMQTT() {
  while (!MQTT.connected()) {
    Serial.println("Tentando se conectar ao Broker MQTT: " + String(BROKER_MQTT));
    if (MQTT.connect("ESP8266-ESP12-E")) {
      Serial.println("Conectado");
      MQTT.subscribe(TOPIC_PING);

    } else {
      Serial.println("Falha ao Reconectar");
      Serial.println("Tentando se reconectar em 2 segundos");
      delay(2000);
    }
  }
}

void recconectWiFi() {
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
}

void enviar() {
  //Aguarda cartao
  while (!mfrc522.PICC_IsNewCardPresent()) {
    delay(100);
  }
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  char PAYLOAD[128];

  snprintf(PAYLOAD, sizeof(PAYLOAD)-1, "%s", "teste" );

  MQTT.publish(TOPIC_PING, PAYLOAD);
 
  // Halt PICC
  mfrc522.PICC_HaltA();
  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();
  delay(1000);
}
