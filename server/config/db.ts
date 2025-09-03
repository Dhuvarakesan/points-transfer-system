import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('points_transfer_system', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql', // Change to your preferred database dialect (e.g., 'postgres', 'sqlite', 'mssql')
});

export default sequelize;
