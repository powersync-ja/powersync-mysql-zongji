# @powersync/mysql-zongji

## 0.2.0

### Minor Changes

- 941b166: Added the functionality to pause / resume the zongji binlog listener
  Improved stop/start functionality to better handle some race conditions
  Added type definitions
  The first time a TableMap event is emitted, it will always be emitted, but subsequent events will only be emitted if the table map has changed.

## 0.1.0

### Minor Changes

- ff85814: Initial release of the powersync-mysql-zongji fork
  - Added custom gtid binlog event
