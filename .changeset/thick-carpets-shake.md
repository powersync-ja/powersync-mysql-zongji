---
'@powersync/mysql-zongji': minor
---

Added the functionality to pause / resume the zongji binlog listener
Improved stop/start functionality to better handle some race conditions
Added type definitions
The first time a TableMap event is emitted, it will always be emitted, but subsequent events will only be emitted if the table map has changed.