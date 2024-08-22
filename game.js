import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Unit {
  constructor(currentHp, maxHp, minDamage, maxDamage, level) {
    this.currentHp = currentHp;
    this.maxHp = maxHp;

    this.currentDamage = minDamage;  // 초기값으로 최소 데미지 사용
    this.minDamage = minDamage;
    this.maxDamage = maxDamage;

    this.level = level;
  }

  attackAction(target, damage) {
    target.currentHp = Math.max(0, Number((target.currentHp - damage).toFixed(1)));
  }

  getDamage() {
    this.currentDamage = getRandomNum(this.minDamage, this.maxDamage);
    return this.currentDamage;
  }
}

class Player extends Unit {
  constructor() {
    super(100, 100, 3, 3.3, 1);

    this.minOringinDamage = 3;
    this.damageMultiplier = 2;
    this.defenseProbability = 20;
    this.runAwayProbability = 25;
    this.comboAttackProbability = 15;

    this.currentExp = 0;
    this.maxExp = 6;
    this.currentExpPercent = 0;

    this.refreshDamageModify();

    this.state = 'idle';
  }

  setPlayerInfo() {
    this.currentHp = this.maxHp;
  }

  comboDamageAction() {
    let firstDamage = this.getDamage();
    let secondDamage = this.getDamage();
    this.currentDamage = firstDamage + secondDamage;
  }

  defenseAction() {
    // 60프로 데미지
    this.currentDamage = Number((this.getDamage() * 0.6).toFixed(1));
  }

  refreshDamageModify() {
    this.minDamage = this.minOringinDamage;
    this.maxDamage = Number((this.minDamage * this.damageMultiplier).toFixed(1));
  }

  getExp(expAmount) {
    this.currentExp =  Number((this.currentExp + expAmount).toFixed(1));

    while (this.currentExp >= this.maxExp) {
      let currentLevel = this.level;
      this.currentExp = Number((this.currentExp - this.maxExp).toFixed(1));
      this.maxExp = Number((this.maxExp * 1.3).toFixed(1));
      this.level += 1;

      console.log(chalk.white(`레벨이 `) + chalk.yellow(`${currentLevel} -> ${this.level}`) + chalk.white.white(` 로 증가하였습니다!`));

      console.log(chalk.yellow("\n                              증가할 능력치를 선택하세요 !"));
      console.log(chalk.gray("=================================================================================================\n") +
        chalk.yellow(
          `1. 공격력 +2.5   2. 체력 +20   3. 최대 공격력 배수 +0.5   4. 연속 공격 확률 +5%   5. 방어 확률 +4%`,
        ) + chalk.gray("\n================================================================================================="));

      const choice = readlineSync.question();

      switch (choice) {
        case '1':
          this.minOringinDamage += 2.5;
          console.log(chalk.white(`공격력이`) + chalk.yellow(`2.5`) + chalk.white(`증가하였습니다!`));
          break;
        case '2':
          this.maxHp += 20;
          console.log(chalk.white(`체력이`) + chalk.yellow(`20`) + chalk.white(`증가하였습니다!`));
          break;
        case '3':
          this.damageMultiplier += 0.5;
          console.log(chalk.white(`최대 공격력 배수가`) + chalk.yellow(`0.5`) + chalk.white(`증가하였습니다!`));
          break;
        case '4':
          this.comboAttackProbability += 5;
          console.log(chalk.white(`연속 공격력 확률이`) + chalk.yellow(`5%`) + chalk.white(`증가하였습니다!`));
          break;
        case '5':
          this.defenseProbability += 4;
          console.log(chalk.white(`방어 확률이`) + chalk.yellow(`4%`) + chalk.white(`하였습니다!`));
          break;
      }

      this.refreshDamageModify();
    }

    this.currentExpPercent = Math.floor((this.currentExp / this.maxExp) * 100);
  }
}

class Monster extends Unit {
  constructor() {
    super(10, 10, 2, 4, 1);
    this.expAmount = 2;
  }

  setMonsterInfo(stage) {
    this.level = Math.floor(getRandomNum(stage.level, stage.level * 2));
    this.maxHp = 8 * this.level;
    this.currentHp = this.maxHp;
    this.minDamage = getRandomNum(this.minDamage * this.level, this.minDamage * (this.level + 1));
    this.maxDamage = getRandomNum(this.maxDamage * this.level, this.maxDamage * (this.level + 1));
    this.expAmount = getRandomNum(this.level * 2.5, this.level * 4);
  }
}

class Stage {
  constructor() {
    this.level = 1;
    this.currentKill = 0;
    this.deadLineKill = 30;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n======================= Current Status =======================`));
  console.log(
    chalk.cyanBright(` Stage: ${stage.level} |` + chalk.yellowBright(`       Player`.padEnd(15, ' ')) + chalk.redBright(`              Monster`) +
      `
          |` + chalk.whiteBright(`      Level : ${player.level}`.padEnd(15, ' ')) + chalk.whiteBright(`             Level : ${monster.level}`) +
      chalk.white(`        
  Limited `.padEnd(0, "    ")) + chalk.cyanBright(`|`) + chalk.green(`    Exp : ${player.currentExp}/${player.maxExp} (${player.currentExpPercent}%)`.padEnd(15, ' ')) + chalk.greenBright(`      ExpAmount : ${monster.expAmount}`) +
      chalk.white(`          
   ${stage.currentKill}/${stage.deadLineKill}   `) + chalk.cyanBright(`|`) + chalk.whiteBright(`    HP : ${player.currentHp}/${player.maxHp}`.padEnd(15, ' ')) + chalk.whiteBright(`            HP : ${monster.currentHp}/${monster.maxHp}`) +
      `          
          |`) + chalk.whiteBright(`    Attack : ${player.minDamage}-${player.maxDamage}`.padEnd(15, ' ')) + chalk.whiteBright(`         Attack : ${monster.minDamage}-${monster.maxDamage}`),
  );
  console.log(chalk.magentaBright(`==============================================================`));
}

const battle = async (stage, player, monster) => {
  let logs = [];
  let turns = 1;

  player.setPlayerInfo();
  monster.setMonsterInfo(stage);

  while (player.currentHp > 0 && monster.currentHp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.gray("==============================================================\n") +
      chalk.yellow(
        `1.기본 공격  2.연속 공격(${player.comboAttackProbability}%)  3.방어태세(${player.defenseProbability}%)   4.도망가기(${player.runAwayProbability}%) `,
      ) + chalk.gray("\n=============================================================="),
    );

    process.stdout.write('당신의 선택은? ');
    const choice = readlineSync.question();

    player.state = 'idle';

    switch (choice) {
      case '1':
        player.attackAction(monster, player.getDamage());
        logs.push(chalk.green(`[${turns}]몬스터에게 ${player.currentDamage}의 피해를 입혔습니다`));
        break;
      case '2':
        if (getRandomProbability(100) <= player.comboAttackProbability) {
          logs.push(chalk.white(`[${turns}] 연속 공격에 `) + chalk.yellow(`성공`) + chalk.white(`하였습니다!`));
          player.comboDamageAction();
          player.attackAction(monster, player.currentDamage);
          logs.push(chalk.green(`[${turns}]몬스터에게 ${player.currentDamage}의 피해를 입혔습니다`));
        }
        else
          logs.push(chalk.white(`[${turns}] 연속 공격에 `) + chalk.redBright(`실패`) + chalk.white(`하였습니다!`));
        break;
      case '3':
        if (getRandomProbability(100) <= player.defenseProbability) {
          player.state = 'defense';
          logs.push(chalk.yellow(`[${turns}] 방어에 `) + chalk.greenBright(`성공`) + chalk.yellow(`하였습니다!`));
          player.defenseAction();
          logs.push(chalk.green(`[${turns}]몬스터에게 ${player.currentDamage}의 피해를 입혔습니다`));
          turns++;
        }
        else
          logs.push(chalk.yellow(`[${turns}] 방어에 `) + chalk.redBright(`실패`) + chalk.yellow(`하였습니다!`));
        break;
      case '4':
        if (getRandomProbability(100) <= player.runAwayProbability) {
          stage.currentKill++;
          player.state = 'runAway';
        }
        else
          logs.push(chalk.yellow(`[${turns}] 도망가기 `) + chalk.redBright(`실패`) + chalk.yellow(`하였습니다!`));

        break;
      default:
        process.exit(0); // 게임 종료
        break;
    }

    if (player.state === 'runAway')
      break;

    if (monster.currentHp > 0 && player.state != 'defense') {
      monster.attackAction(player, monster.getDamage());
      logs.push(chalk.magentaBright(`[${turns}] 몬스터가 ${monster.currentDamage}의 피해를 입혔습니다`));
      turns++;
    }
  }

  if (player.state != 'runAway') {
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));

    if (monster.currentHp <= 0) {
      stage.currentKill++;
      console.log((chalk.whiteBright(`[${turns}] 몬스터를 처치했습니다 !`)));
      console.log((chalk.greenBright(`[${turns}] 경험치 ${monster.expAmount}을 획득 하였습니다!`)));
      player.getExp(monster.expAmount);
    }
    else if (player.currentHp <= 0) {
      console.log(chalk.redBright(`플레이어가 사망하였습니다 !`));
      process.exit(0);
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  const stage = new Stage();

  while (stage.level <= 10) {
    const monster = new Monster();
    await battle(stage, player, monster);

    if(stage.currentKill > stage.deadLineKill)
    {
      console.log(chalk.yellow(`클리어 조건 몬스터 수를 `) + chalk.redBright(`초과`) + chalk.yellow(`하였습니다!!`));
      console.log(chalk.redBright(`패배 !!!`));
      break;
    }
    else if(stage.level >= 10)
    {
      console.log(chalk.whiteBright(`클리어 조건을 `) + chalk.yellow(`달성`) + chalk.whiteBright(`하였습니다!!`));
      console.log(chalk.cyanBright(`승리 !!!`));
      break;
    }

    if (player.state === 'runAway')
      console.log(chalk.yellow(`도망가기를 `) + chalk.green(`성공`) + chalk.yellow(`하였습니다!`));
    
    console.log(
      chalk.yellowBright('-----------------------------\n') +
      chalk.whiteBright('     1. 다른 몬스터 찾기\n') +
      chalk.whiteBright('    2. 다음 스테이지 이동\n') +
      chalk.yellowBright('-----------------------------'));
    // 스테이지 클리어 및 게임 종료 조건

    const choice = readlineSync.question();

    switch (choice) {
      case '1':
        continue;
      case '2':
        stage.level++;
        continue;

      default:
        continue;
    }
  }


}

function getRandomProbability(max) {
  return Math.floor(Math.random() * (max + 1));
}

function getRandomNum(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(1));
}
