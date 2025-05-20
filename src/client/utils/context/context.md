- NO SUB

  - Provider connects first, then Consumer

    - Provider listens on CONSUMER_PRESENCE event on itself element
    - Consumer triggers CONSUMER_PRESENCE event with bubbling from itself element
    - Provider catched CONSUMER_PRESENCE event then call stop propagation then stores Consumer instance
    - Provider informs Consumer for the connection

  - Consumer connects first, then Provider

    - Consumer listens on PROVIDER_PRESENCE event on the root element
    - Provider listens on CONSUMER_PRESENCE event on itself element
    - Provider triggers PROVIDER_PRESENCE event on the root
    - Consumer catched PROVIDER_PRESENCE event on the root then triggers CONSUMER_PRESENCE event with bubbling
    - Provider catched CONSUMER_PRESENCE event then call stop propagation then stores Consumer instance
    - Provider informs Consumer for the connection
    - Consumer remove listener on PROVIDER_PRESENCE event on the root element

- SUB

  - Provider connects first, then Consumer

    - Provider listens on SUB_CONSUMER_PRESENCE event on the root element
    - Consumer triggers SUB_CONSUMER_PRESENCE event on the root element
    - Provider catched SUB_CONSUMER_PRESENCE on the root element then (maybe call stop propagation) then stores Consumer instance
    - Provider informs Consumer for the connection

  - Consumer connects first, then Provider

    - Consumer listens on SUB_PROVIDER_PRESENCE event on the root element
    - Provider listens on SUB_CONSUMER_PRESENCE event on the root element
    - Provider triggers SUB_PROVIDER_PRESENCE event on the root
    - Consumer catched SUB_PROVIDER_PRESENCE event on the root then triggers SUB_CONSUMER_PRESENCE event on the root
    - Provider catched SUB_CONSUMER_PRESENCE event then (maybe call stop propagation) then stores Consumer instance
    - Provider informs Consumer for the connection
    - Consumer remove listener on SUB_PROVIDER_PRESENCE event on the root element

- Provider Connection

  - listens on CONSUMER_PRESENCE event on itself element
  - listens on SUB_CONSUMER_PRESENCE event on the root element if SUB is set
  - triggers PROVIDER_PRESENCE event on the root
  - triggers SUB_PROVIDER_PRESENCE event on the root if SUB is set
  - catched CONSUMER_PRESENCE/SUB_CONSUMER_PRESENCE event then call stop propagation then stores Consumer instance
  - informs Consumer for the connection
  - listens on CONSUMER_DISCONNECTION event on itself element if triggered then remove consumer instance from store

- Provider Disconnection
  - Remove all listeners
  - Triggers PROVIDER_DISCONNECTED to all consumer
  - clean up all consumers instances
